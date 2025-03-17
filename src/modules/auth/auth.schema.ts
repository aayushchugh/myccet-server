import { z } from "zod";
import { Designation, Role } from "../../db/schema/user";

const instituteDomain = process.env.INSTITUTE_DOMAIN;
if (!instituteDomain) {
	throw new Error(
		"INSTITUTE_DOMAIN is not defined in the environment variables."
	);
}

const emailRegex = new RegExp(
	`^[a-zA-Z0-9._%+-]+@${instituteDomain.replace(/\./g, "\\.")}$`
);

export const postSignupBodySchema = z.object({
	email: z
		.string()
		.email({ message: "please enter a valid email" })
		.regex(emailRegex, `email must be on ${instituteDomain} domain`),
	password: z
		.string({ required_error: "password is required" })
		.min(6, { message: "password should be at least 6 characters" }),
	first_name: z.string({ required_error: "first name is required" }),
	middle_name: z.string().optional(),
	last_name: z.string().optional(),
	phone: z
		.number({ required_error: "phone number is required" })
		.min(1000000000, { message: "phone number should be at least 10 digits" })
		.max(9999999999, { message: "phone number should be at least 10 digits" }),
	role: z.enum([Role.ADMIN, Role.FACULTY]),
	designation: z.enum([Designation.MAINTENANCE, Designation.PRINCIPAL]),
});
export type PostSignupBody = z.infer<typeof postSignupBodySchema>;

export const postLoginBodySchema = z.object({
	email: z
		.string({ required_error: "email is required" })
		.email({ message: "please enter a valid email" }),
	password: z.string({ required_error: "password is required" }),
});

export type PostLoginBody = z.infer<typeof postLoginBodySchema>;
