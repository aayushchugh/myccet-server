import { z } from "zod";
import { Designation } from "../../db/schema/user";

export const postAdminBodySchema = z.object({
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
	designation: z.enum([
		Designation.HOD,
		Designation.LECTURER,
		Designation.Maintenance,
	]),
});

export type PostAdminBody = z.infer<typeof postAdminBodySchema>;
