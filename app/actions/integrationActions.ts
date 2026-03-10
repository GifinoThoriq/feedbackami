"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type ActionResult = { ok: true } | { ok: false; error: string };

export interface Integration {
  id: string;
  board_id: string;
  type: "discord" | "slack" | "custom";
  webhook_url: string;
  created_at: string;
}

export async function saveIntegration(
  boardId: string,
  type: "discord" | "slack" | "custom",
  webhookUrl: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const { error } = await supabase.from("board_integrations").upsert(
    { board_id: boardId, type, webhook_url: webhookUrl },
    { onConflict: "board_id" }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getIntegration(boardId: string): Promise<Integration | null> {
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from("board_integrations")
    .select("*")
    .eq("board_id", boardId)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function deleteIntegration(boardId: string): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const { error } = await supabase
    .from("board_integrations")
    .delete()
    .eq("board_id", boardId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
