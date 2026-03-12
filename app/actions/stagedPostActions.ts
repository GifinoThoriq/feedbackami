"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { IStagedPost } from "@/interface/inbound.interface";
import { savePost } from "@/app/actions/postActions";

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

export async function approveStagedPost(
  stagedId: string,
  boardId: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  // Fetch the staged post
  const { data: staged, error: fetchError } = await supabase
    .from("staged_posts")
    .select("*")
    .eq("id", stagedId)
    .eq("board_id", boardId)
    .maybeSingle();

  if (fetchError || !staged) return { ok: false, error: "Staged post not found" };

  // Publish via savePost
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

export async function triggerProcess(boardId: string): Promise<ActionResult> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // We need to forward the session cookie to the API route
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${siteUrl}/api/process/${boardId}`, {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 429 || body.error === "quota_exceeded") {
      return { ok: false, error: body.message ?? "Sorry, the AI API daily limit has been reached. Try again tomorrow." };
    }
    return { ok: false, error: body.error ?? "Process failed" };
  }

  return { ok: true };
}
