import { z } from "zod";

export const postCreateSubjectSchema = z.object({
  title: z.string({ required_error: "please enter title" }),
  code: z.string({ required_error: "please enter code" }),
});

export type PostCreateSubjectBody = z.infer<typeof postCreateSubjectSchema>;

export const putUpdateSubjectSchema = z.object({
  title: z.string().optional(),
  code: z.string().optional(),
});

export type PutUpdateSubjectBody = z.infer<typeof putUpdateSubjectSchema>;
