"use server";

import { IPost } from "@/interface/post.interface";
import { createClient } from "@/lib/supabase/server";
import { createPostSchema } from "@/lib/validation/post";
import { cookies } from "next/headers";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function savePost(values: any): Promise<ActionResult> {
  const parsed = createPostSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid Data",
    };
  }

  const supabase = createClient(cookies());

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase.from("posts").insert([
    {
      board_id: parsed.data.board_id,
      title: parsed.data.title,
      details: parsed.data.title,
      user_id: user.id,
    },
  ]);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getMyPosts(): Promise<IPost[]> {
  const supabase = createClient(cookies());

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        profile_color
      ),
      post_tags (
        tags (
          id,
          name,
          color,
          user_id
        )
      )
    `)
    .eq("user_id", user.id);

  if (error) throw error;

  return data.map((post: any) => ({
    ...post,
    tags: (post.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean),
  }));
}

export async function updatePostStatus(
  postId: string,
  statusId: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const { error } = await supabase
    .from("posts")
    .update({ status_id: statusId })
    .eq("id", postId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePostBoard(
  postId: string,
  boardId: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const { error } = await supabase
    .from("posts")
    .update({ board_id: boardId })
    .eq("id", postId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
