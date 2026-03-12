"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { IInboundSource } from "@/interface/inbound.interface";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function getInboundSources(boardId: string): Promise<IInboundSource[]> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("inbound_sources")
    .select("*")
    .eq("board_id", boardId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function saveInboundSource(
  boardId: string | null,
  sourceType: "slack" | "discord" | "custom",
  label: string
): Promise<{ ok: true; endpointUrl: string; token: string } | { ok: false; error: string }> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("inbound_sources")
    .insert({ board_id: boardId || null, user_id: user.id, source_type: sourceType, label: label || null })
    .select("id, secret_token")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Insert failed" };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourdomain.com";
  const endpointUrl = `${siteUrl}/api/inbound/${data.id}`;

  return { ok: true, endpointUrl, token: data.secret_token };
}

export async function deleteInboundSource(sourceId: string): Promise<ActionResult> {
  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("inbound_sources")
    .delete()
    .eq("id", sourceId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
