import { z } from "zod";

//register
export const registerSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[a-z]/, "Add at least one lowercase letter")
      .regex(/\d/, "Add at least one number"),
    passwordConfirm: z.string(),
  })
  .refine((vals) => vals.password === vals.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match",
  });

export type RegisterInput = z.infer<typeof registerSchema>;
