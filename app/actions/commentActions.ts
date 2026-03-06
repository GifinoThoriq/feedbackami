"use server";

import { IComment } from "@/interface/comment.interface";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function getCommentsByPost(postId: string): Promise<IComment[]> {
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        profile_color
      )
    `)
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
  if (!values.content.trim()) return { ok: false, error: "Content is required" };

  const supabase = createClient(cookies());

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
