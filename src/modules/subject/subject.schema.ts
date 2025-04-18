import e from "express";
import { z } from "zod";

export const postCreateSubjectSchema = z.object({
	title: z.string({ required_error: "please enter title" }),
	code: z.string({ required_error: "please enter code" }),
	internal_passing_marks: z
		.number({ required_error: "please enter internal passing marks" })
		.min(0, "internal passing marks cannot be negative"),
	external_passing_marks: z
		.number({ required_error: "please enter external passing marks" })
		.min(0, "external passing marks cannot be negative"),
});

export type PostCreateSubjectBody = z.infer<typeof postCreateSubjectSchema>;

export const putUpdateSubjectSchema = z.object({
	title: z.string().optional(),
	code: z.string().optional(),
	internal_passing_marks: z
		.number()
		.min(0, "internal passing marks cannot be negative")
		.optional(),
	external_passing_marks: z
		.number()
		.min(0, "external passing marks cannot be negative")
		.optional(),
});

export type PutUpdateSubjectBody = z.infer<typeof putUpdateSubjectSchema>;
