import { z } from "zod";

export const uuidSchema = z
  .string()
  .refine(
    (val) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        val
      ),
    {
      message: "Invalid UUID format",
    }
  );

// CREATE
export const createPostSchema = z.object({
  board_id: uuidSchema,
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  details: z
    .string()
    .max(500, "Details too long")
    .optional()
    .nullable()
    .optional(),
  status_id: uuidSchema.optional().nullable().optional(),
});

//SUMMARY
export type CreatePostInput = z.infer<typeof createPostSchema>;
