import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cookies } from "next/headers";
import Groq from "groq-sdk";

const BATCH_SIZE = 7;

export async function POST(_req: NextRequest) {
  try {
    return await handleProcess(_req);
  } catch (err) {
    console.error("[process] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

async function handleProcess(_req: NextRequest) {
  // Authenticate via session
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();

  // Get all inbound source IDs owned by this user
  const { data: sources } = await service
    .from("inbound_sources")
    .select("id")
    .eq("user_id", user.id);

  const sourceIds = (sources ?? []).map((s: { id: string }) => s.id);

  if (sourceIds.length === 0) {
    return NextResponse.json({ ok: true, grouped: 0, message: "No inbound sources configured" });
  }

  // Fetch unprocessed feedback from user's sources
  const { data: rows, error } = await service
    .from("raw_feedback")
    .select("id, content, author")
    .in("source_id", sourceIds)
    .eq("processed", false)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rows || rows.length < 1) {
    return NextResponse.json({
      ok: true,
      grouped: 0,
      message: "Not enough feedback to process",
    });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async function callGroq(content: string): Promise<string> {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content }],
    });
    return completion.choices[0].message.content?.trim() ?? "";
  }

  // Chunk into batches
  const batches: typeof rows[] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  const usedIds: string[] = [];

  for (const batch of batches) {
    const messages = batch.map(
      (r, i) => `[${i + 1}] ${r.author ? `${r.author}: ` : ""}${r.content}`
    );

    // Step 1: Summarize the batch
    let summary: string;
    try {
      summary = await callGroq(
        `Summarize the key themes and concerns from these ${batch.length} product feedback messages in 2-3 sentences:\n${messages.join("\n")}`
      );
    } catch (aiErr: unknown) {
      const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      const isQuota =
        (aiErr as { status?: number })?.status === 429 ||
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("quota");
      if (isQuota) {
        console.error("[process] Groq rate limit error:", aiErr);
        return NextResponse.json(
          {
            error: "quota_exceeded",
            message: "Sorry, the AI API rate limit has been reached. Try again in a moment.",
            rawError: msg,
          },
          { status: 429 }
        );
      }
      console.error("[process] Groq error:", aiErr);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Step 2: Generate staged post from summary
    let rawJson: string;
    try {
      rawJson = await callGroq(
        `You are a product feedback analyst. Based on these user feedback messages, generate a single staged post.\nReturn ONLY valid JSON (no markdown): {"title":"...","details":"..."}\ntitle max 200 chars, details max 500 chars.\nSummary:\n${summary}`
      );
    } catch (aiErr: unknown) {
      const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
      const isQuota =
        (aiErr as { status?: number })?.status === 429 ||
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("quota");
      if (isQuota) {
        console.error("[process] Groq rate limit error:", aiErr);
        return NextResponse.json(
          {
            error: "quota_exceeded",
            message: "Sorry, the AI API rate limit has been reached. Try again in a moment.",
            rawError: msg,
          },
          { status: 429 }
        );
      }
      console.error("[process] Groq error:", aiErr);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Strip markdown fences, parse
    const jsonText = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    let post: { title: string; details: string };
    try {
      post = JSON.parse(jsonText);
    } catch {
      continue; // skip bad batch, don't fail the whole request
    }

    await service.from("staged_posts").insert({
      user_id: user.id,
      board_id: null,
      title: post.title.slice(0, 200),
      details: post.details?.slice(0, 500) ?? null,
      raw_feedback_ids: batch.map((r) => r.id),
    });

    usedIds.push(...batch.map((r) => r.id));
  }

  if (usedIds.length > 0) {
    await service
      .from("raw_feedback")
      .update({ processed: true })
      .in("id", usedIds);
  }

  return NextResponse.json({ ok: true, grouped: batches.length });
}
