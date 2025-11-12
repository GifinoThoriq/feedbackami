"use server";

import { IStatus } from "@/interface/status.interface";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getStatus(): Promise<IStatus[]> {
  const supabase = createClient(cookies());

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return [];

  const { data, error } = await supabase.from("status").select("*");

  if (error) throw error;
  return data;
}
