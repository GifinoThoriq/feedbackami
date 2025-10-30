"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = createClient(cookies());
  await supabase.auth.signOut(); // removes the auth cookies on the server
  redirect("/auth/login");
}
