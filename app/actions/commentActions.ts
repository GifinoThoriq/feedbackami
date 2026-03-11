"use server";

import { IComment } from "@/interface/comment.interface";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function getCommentsByPost(postId: string): Promise<IComment[]> {
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles (
        first_name,
        last_name,
        profile_color
      )
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data;
}

export async function saveComment(values: {
  post_id: string;
  content: string;
  parent_id?: string;
  user_id?: string;
  guest_name?: string;
  guest_email?: string;
}): Promise<ActionResult> {
  if (values.content.trim().length < 2)
    return { ok: false, error: "Comment too short." };
  if (values.content.length > 1000)
    return { ok: false, error: "Comment too long (max 1000 chars)." };

  const supabase = createClient(cookies());

  const windowStart = new Date(Date.now() - 60_000).toISOString();

  if (values.user_id) {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", values.user_id)
      .gte("created_at", windowStart);
    if ((count ?? 0) >= 5)
      return { ok: false, error: "Too many comments. Slow down." };
  } else if (values.guest_name) {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("guest_name", values.guest_name.trim().toLowerCase())
      .gte("created_at", windowStart);
    if ((count ?? 0) >= 3)
      return { ok: false, error: "Too many comments. Slow down." };
  }

  const { error } = await supabase.from("comments").insert([
    {
      post_id: values.post_id,
      content: values.content,
      parent_id: values.parent_id ?? null,
      user_id: values.user_id ?? null,
      guest_name: values.guest_name ?? null,
      guest_email: values.guest_email ?? null,
    },
  ]);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
