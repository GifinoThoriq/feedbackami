"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type ActionResult = { ok: true } | { ok: false; error: string };

export interface Integration {
  id: string;
  board_id: string | null;
  type: "discord" | "slack" | "custom";
  webhook_url: string;
  created_at: string;
}

export async function saveIntegration(
  boardId: string | null,
  type: "discord" | "slack" | "custom",
  webhookUrl: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  if (boardId === null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    // Manual upsert for global (null board_id) since null doesn't trigger unique constraints
    const { data: existing } = await supabase
      .from("board_integrations")
      .select("id")
      .is("board_id", null)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("board_integrations")
        .update({ type, webhook_url: webhookUrl })
        .eq("id", existing.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("board_integrations")
        .insert({ board_id: null, user_id: user.id, type, webhook_url: webhookUrl });
      if (error) return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  const { error } = await supabase.from("board_integrations").upsert(
    { board_id: boardId, type, webhook_url: webhookUrl },
    { onConflict: "board_id" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getIntegration(boardId: string | null): Promise<Integration | null> {
  const supabase = createClient(cookies());

  const query = supabase.from("board_integrations").select("*");
  const { data, error } = boardId === null
    ? await query.is("board_id", null).maybeSingle()
    : await query.eq("board_id", boardId).maybeSingle();

  if (error) return null;
  return data;
}

export async function deleteIntegration(boardId: string | null): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const query = supabase.from("board_integrations").delete();
  const { error } = boardId === null
    ? await query.is("board_id", null)
    : await query.eq("board_id", boardId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
