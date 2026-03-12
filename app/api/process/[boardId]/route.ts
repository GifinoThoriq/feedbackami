import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;

  // Authenticate via session
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify board ownership
  const { data: board } = await supabase
    .from("board")
    .select("id, name")
    .eq("id", boardId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const service = createServiceClient();

  // Fetch unprocessed feedback
  const { data: rows, error } = await service
    .from("raw_feedback")
    .select("id, content, author")
    .eq("board_id", boardId)
    .eq("processed", false)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rows || rows.length < 2) {
    return NextResponse.json({
      ok: true,
      grouped: 0,
      message: "Not enough feedback to process",
    });
  }

  // Build prompt
  const messages = rows.map(
    (r, i) => `[${i}] ${r.author ? `${r.author}: ` : ""}${r.content}`
  );
  const prompt = `You are a product feedback analyst. Here are ${
    rows.length
  } messages for "${board.name}".
Group them by theme and return ONLY valid JSON (no markdown, no extra text):
[{"title":"...","details":"...","indices":[0,1,...]}]
title max 200 chars, details max 500 chars.
Messages:
${messages.join("\n")}`;

  let rawText: string;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    rawText = result.response.text().trim();
  } catch (aiErr: unknown) {
    const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
    const isQuota =
      (aiErr as { status?: number })?.status === 429 ||
      msg.toLowerCase().includes("quota") ||
      msg.toLowerCase().includes("exhausted");
    if (isQuota) {
      return NextResponse.json(
        {
          error: "quota_exceeded",
          message:
            "Sorry, the AI API daily limit has been reached. Try again tomorrow.",
        },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  let groups: Array<{ title: string; details: string; indices: number[] }> = [];
  try {
    groups = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: rawText },
      { status: 500 }
    );
  }

  if (!Array.isArray(groups) || groups.length === 0) {
    return NextResponse.json({ ok: true, grouped: 0 });
  }

  // Insert staged posts and mark feedback as processed
  const usedIds: string[] = [];

  for (const group of groups) {
    const feedbackIds = (group.indices ?? [])
      .filter((i: number) => i >= 0 && i < rows.length)
      .map((i: number) => rows[i].id);

    await service.from("staged_posts").insert({
      board_id: boardId,
      title: group.title.slice(0, 200),
      details: group.details?.slice(0, 500) ?? null,
      raw_feedback_ids: feedbackIds,
    });

    usedIds.push(...feedbackIds);
  }

  if (usedIds.length > 0) {
    await service
      .from("raw_feedback")
      .update({ processed: true })
      .in("id", usedIds);
  }

  return NextResponse.json({ ok: true, grouped: groups.length });
}
