import { z } from "zod";

export const postAdminSignupBodySchema = z.object({
	email: z.string().email(),
	password: z.string({ required_error: "password is required" }).min(6),
	first_name: z.string({ required_error: "first name is required" }),
	middle_name: z.string().optional(),
	last_name: z.string().optional(),
	phone: z
		.number({ required_error: "phone number is required" })
		.min(1000000000, { message: "phone number should be at least 10 digits" })
		.max(9999999999, { message: "phone number should be at least 10 digits" }),
});
export type PostAdminSignupBody = z.infer<typeof postAdminSignupBodySchema>;
