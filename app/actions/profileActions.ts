"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";

export type ProfileInput = {
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  profile_color: string;
};

type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveOnboardingProfileAction(
  values: ProfileInput
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid data",
    };
  }

  const supabase = createClient(cookies());
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      date_of_birth: parsed.data.dateOfBirth,
      profile_color: parsed.data.profile_color,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getProfile() {
  const supabase = createClient(cookies());

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}
