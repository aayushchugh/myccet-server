import { z } from "zod";
import { Designation, Role } from "../../db/schema/user";

export const postSignupBodySchema = z.object({
	email: z.string().email(),
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
	designation: z.enum([
		Designation.HOD,
		Designation.LECTURER,
		Designation.Maintenance,
	]),
});
export type PostSignupBody = z.infer<typeof postSignupBodySchema>;

export const postLoginBodySchema = z.object({
	email: z
		.string({ required_error: "email is required" })
		.email({ message: "please enter a valid email" }),
	password: z.string({ required_error: "password is required" }),
});

export type PostLoginBody = z.infer<typeof postLoginBodySchema>;
