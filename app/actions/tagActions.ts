"use server";

import { ITag } from "@/interface/tag.interface";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function getTags(): Promise<ITag[]> {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  if (error) return [];
  return data;
}

export async function createTag(
  name: string,
  color?: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("tags").insert([
    { name, color: color ?? "#6366f1", user_id: user.id },
  ]);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function addTagToPost(
  postId: string,
  tagId: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const { error } = await supabase
    .from("post_tags")
    .insert([{ post_id: postId, tag_id: tagId }]);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function removeTagFromPost(
  postId: string,
  tagId: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const { error } = await supabase
    .from("post_tags")
    .delete()
    .eq("post_id", postId)
    .eq("tag_id", tagId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
