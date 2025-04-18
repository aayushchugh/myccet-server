import { z } from "zod";

export const postMarksSchema = z.object({
	student_id: z.number({ required_error: "please enter student id" }),
	semester_id: z.number({ required_error: "please enter semester id" }),
	subject_id: z.number({ required_error: "please enter subject id" }),
	internal_marks: z
		.number({ required_error: "please enter internal marks" })
		.min(0, "internal marks cannot be negative"),
	external_marks: z
		.number({ required_error: "please enter external marks" })
		.min(0, "external marks cannot be negative"),
});

export type PostMarksBody = z.infer<typeof postMarksSchema>;

export const getMarksSchema = z.object({
	student_id: z.string().transform(val => parseInt(val)),
	semester_id: z.string().transform(val => parseInt(val)),
});
