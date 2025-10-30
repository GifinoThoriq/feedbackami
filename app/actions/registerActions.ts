"use server";

import { registerSchema } from "@/lib/validation/auth";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type RegisterInput = {
  email: string;
  password: string;
  passwordConfirm: string;
};

type ActionResult = { ok: true } | { ok: false; error: string };

export async function registerAction(
  values: RegisterInput
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const supabase = createClient(cookies());
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
