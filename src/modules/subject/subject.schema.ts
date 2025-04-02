import e from "express";
import { z } from "zod";

export const postCreateSubjectSchema = z.object({
  title: z.string({ required_error: "please enter title" }),
  code: z.string({ required_error: "please enter code" }),
  internal_marks: z.number({ required_error: "please enter internal marks" }),
  external_marks: z.number({ required_error: "please enter external marks" }),
});

export type PostCreateSubjectBody = z.infer<typeof postCreateSubjectSchema>;

export const putUpdateSubjectSchema = z.object({
  title: z.string().optional(),
  code: z.string().optional(),
  internal_marks: z.number().optional(),
  external_marks: z.number().optional(),
});

export type PutUpdateSubjectBody = z.infer<typeof putUpdateSubjectSchema>;
