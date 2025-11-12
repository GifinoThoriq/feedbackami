import { z } from "zod";

export const boardSchema = z.object({
  name: z.string().trim().min(1, "Name is Required"),
  url: z.string().trim().min(1, "Url is Required"),
});

export type BoardInput = z.infer<typeof boardSchema>;
