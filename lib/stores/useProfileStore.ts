"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { ProfileInput } from "@/lib/validation/profile";

export type ProfileRecord = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_color: string | null;
  date_of_birth: string | null;
  [key: string]: unknown;
};

type ProfileStore = {
  profile: ProfileRecord | null;
  loading: boolean;
  error: string | null;
  hydrate: (profile: ProfileRecord | null) => void;
  fetchProfile: () => Promise<void>;
  updateFromForm: (values: ProfileInput) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  loading: false,
  error: null,
  hydrate: (profile) => set({ profile }),
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }

      const user = auth.user;
      if (!user?.id) {
        set({ profile: null, loading: false, error: "Not authenticated" });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      set({ profile: data as ProfileRecord, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load profile";
      set({ error: message, loading: false });
    }
  },
  updateFromForm: (values) =>
    set((state) => {
      if (!state.profile) {
        return {};
      }

      return {
        profile: {
          ...state.profile,
          first_name: values.firstName,
          last_name: values.lastName,
          date_of_birth: values.dateOfBirth,
          profile_color: values.profile_color,
        },
      };
    }),
}));
