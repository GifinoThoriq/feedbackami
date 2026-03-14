"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { IStagedPost } from "@/interface/inbound.interface";
import { savePost } from "@/app/actions/postActions";
import Groq from "groq-sdk";

const BATCH_SIZE = 7;

type ActionResult = { ok: true } | { ok: false; error: string };

export async function getStagedPosts(boardId: string): Promise<IStagedPost[]> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("staged_posts")
    .select("*")
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAllStagedPosts(): Promise<IStagedPost[]> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("staged_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function approveStagedPost(
  stagedId: string,
  boardId: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  // Fetch the staged post — ownership check via user_id
  const { data: staged, error: fetchError } = await supabase
    .from("staged_posts")
    .select("*")
    .eq("id", stagedId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !staged) return { ok: false, error: "Staged post not found" };

  // Publish via savePost to the chosen board
  const result = await savePost({
    board_id: boardId,
    title: staged.title,
    details: staged.details ?? "",
  });

  if (!result.ok) return result;

  // Delete staged post
  await supabase.from("staged_posts").delete().eq("id", stagedId);

  return { ok: true };
}

export async function discardStagedPost(stagedId: string): Promise<ActionResult> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("staged_posts")
    .delete()
    .eq("id", stagedId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function discardAllStagedPosts(): Promise<ActionResult> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("staged_posts")
    .delete()
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function triggerProcess(): Promise<ActionResult> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const service = createServiceClient();

  const { data: sources } = await service
    .from("inbound_sources")
    .select("id")
    .eq("user_id", user.id);

  const sourceIds = (sources ?? []).map((s: { id: string }) => s.id);

  if (sourceIds.length === 0) {
    return { ok: true };
  }

  const { data: rows, error: rowsError } = await service
    .from("raw_feedback")
    .select("id, content, author")
    .in("source_id", sourceIds)
    .eq("processed", false)
    .order("created_at", { ascending: true });

  if (rowsError) return { ok: false, error: rowsError.message };
  if (!rows || rows.length === 0) return { ok: true };

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async function callGroq(content: string): Promise<string> {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content }],
    });
    return completion.choices[0].message.content?.trim() ?? "";
  }

  const batches: (typeof rows)[] = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  const usedIds: string[] = [];

  for (const batch of batches) {
    const messages = batch.map(
      (r, i) => `[${i + 1}] ${r.author ? `${r.author}: ` : ""}${r.content}`
    );

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
      return {
        ok: false,
        error: isQuota
          ? "Sorry, the AI API rate limit has been reached. Try again in a moment."
          : msg,
      };
    }

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
      return {
        ok: false,
        error: isQuota
          ? "Sorry, the AI API rate limit has been reached. Try again in a moment."
          : msg,
      };
    }

    const jsonText = rawJson
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    let post: { title: string; details: string };
    try {
      post = JSON.parse(jsonText);
    } catch {
      continue;
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

  return { ok: true };
}
