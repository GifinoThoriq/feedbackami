"use server";

import { IVote } from "@/interface/vote.interface";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function getVotesByPost(postId: string): Promise<IVote[]> {
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId);

  if (error) return [];

  const userIds = data
    .map((v) => v.user_id)
    .filter((id): id is string => id !== null);

  if (userIds.length === 0) return data;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, profile_color")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  return data.map((vote) => ({
    ...vote,
    profiles: vote.user_id ? profileMap.get(vote.user_id) ?? null : null,
  }));
}

export async function toggleVote(
  postId: string,
  guestIdentifier?: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check if authenticated user already voted
    const { data: existing } = await supabase
      .from("votes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("votes").delete().eq("id", existing.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("votes").insert([{ post_id: postId, user_id: user.id }]);
      if (error) return { ok: false, error: error.message };
    }
  } else if (guestIdentifier) {
    // Guest vote
    const { data: existing } = await supabase
      .from("votes")
      .select("id")
      .eq("post_id", postId)
      .eq("guest_identifier", guestIdentifier)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("votes").delete().eq("id", existing.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("votes").insert([{ post_id: postId, guest_identifier: guestIdentifier }]);
      if (error) return { ok: false, error: error.message };
    }
  } else {
    return { ok: false, error: "Not authenticated and no guest identifier provided" };
  }

  return { ok: true };
}
