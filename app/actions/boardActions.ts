"use server";

import { IBoard } from "@/interface/board.interface";
import { createClient } from "@/lib/supabase/server";
import { boardSchema } from "@/lib/validation/board";
import { cookies } from "next/headers";

export interface BoardInput {
  name: string;
  url: string;
}

type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveBoard(values: BoardInput): Promise<ActionResult> {
  const parsed = boardSchema.safeParse(values);

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

  const { error } = await supabase.from("board").insert([
    {
      name: parsed.data.name,
      url: parsed.data.url,
      user_id: user.id,
    },
  ]);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getBoards(): Promise<IBoard[]> {
  const supabase = createClient(cookies());

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("board")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;
  return data;
}
