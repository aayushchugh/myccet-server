import { z } from "zod";

export const postMarksBodySchema = z.object({
	student_id: z.number({ required_error: "Student ID is required" }),
	subject_id: z.number({ required_error: "Subject ID is required" }),
	internal_marks: z.number({ required_error: "Internal marks is required" }),
	external_marks: z.number({ required_error: "External marks is required" }),
});

export type PostMarksBodySchema = z.infer<typeof postMarksBodySchema>;
