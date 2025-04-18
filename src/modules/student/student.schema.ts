import { z } from "zod";

const instituteDomain = process.env.INSTITUTE_DOMAIN;
if (!instituteDomain) {
	throw new Error(
		"INSTITUTE_DOMAIN is not defined in the environment variables."
	);
}

const emailRegex = new RegExp(
	`^[a-zA-Z0-9._%+-]+@${instituteDomain.replace(/\./g, "\\.")}$`
);

export const postCreateStudentSchema = z.object({
	email: z
		.string({ required_error: "please enter email" })
		.email({ message: "please enter valid email" })
		.refine(
			email => email.endsWith(process.env.INSTITUTE_DOMAIN || ""),
			"email must be from institute domain"
		),
	password: z.string({ required_error: "please enter password" }),
	first_name: z.string({ required_error: "please enter first name" }),
	middle_name: z.string().optional(),
	last_name: z.string().optional(),
	phone: z.number({ required_error: "please enter phone" }),
	branch_id: z.number({ required_error: "please enter branch" }),
	batch_id: z.number({ required_error: "please enter batch" }),
	registration_number: z.number({
		required_error: "please enter registration number",
	}),
	father_name: z.string({ required_error: "please enter father name" }),
	mother_name: z.string({ required_error: "please enter mother name" }),
	category: z.string({ required_error: "please enter category" }),
	current_semester_id: z.number({
		required_error: "please enter current semester",
	}),
});

export type PostCreateStudentBody = z.infer<typeof postCreateStudentSchema>;

export const putStudentSchema = z.object({
	email: z
		.string()
		.email({ message: "please enter valid email" })
		.refine(
			email => email.endsWith(process.env.INSTITUTE_DOMAIN || ""),
			"email must be from institute domain"
		)
		.optional(),
	first_name: z.string().optional(),
	middle_name: z.string().optional(),
	last_name: z.string().optional(),
	phone: z.number().optional(),
	branch_id: z.number().optional(),
	batch_id: z.number().optional(),
	registration_number: z.number().optional(),
	father_name: z.string().optional(),
	mother_name: z.string().optional(),
	category: z.string().optional(),
	current_semester_id: z.number().optional(),
});

export type PutStudentBody = z.infer<typeof putStudentSchema>;

export const getStudentSemestersSchema = z.object({
	params: z.object({
		id: z.string().transform(val => parseInt(val)),
	}),
});

export type GetStudentSemestersRequest = z.infer<
	typeof getStudentSemestersSchema
>;

// Marks schemas
export const postMarksSchema = z.object({
	semester_id: z.number({ required_error: "please enter semester id" }),
	marks: z
		.array(
			z.object({
				subject_id: z.number({ required_error: "please enter subject id" }),
				internal_marks: z
					.number({ required_error: "please enter internal marks" })
					.min(0, "internal marks cannot be negative"),
				external_marks: z
					.number({ required_error: "please enter external marks" })
					.min(0, "external marks cannot be negative"),
			})
		)
		.min(1, "at least one subject's marks must be provided"),
});

export type PostMarksBody = z.infer<typeof postMarksSchema>;

export const putMarksSchema = z.object({
	internal_marks: z
		.number({ required_error: "please enter internal marks" })
		.min(0, "internal marks cannot be negative"),
	external_marks: z
		.number({ required_error: "please enter external marks" })
		.min(0, "external marks cannot be negative"),
});

export type PutMarksBody = z.infer<typeof putMarksSchema>;
