// lib/validation/profile.ts
import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  profile_color: z.string().min(1, "color is required").max(50),
  dateOfBirth: z
    .string()
    .refine(
      (s) => !Number.isNaN(Date.parse(s)),
      "Enter a valid date (YYYY-MM-DD)"
    ),
});

export type ProfileInput = z.infer<typeof profileSchema>;
