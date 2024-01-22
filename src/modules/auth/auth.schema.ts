import { z } from "zod";
import { UserRoles } from "@prisma/client";

export const postLoginSchema = z.object({
	body: z
		.object({
			email: z
				.string({ required_error: "email is required" })
				.email({ message: "email is not valid" }),
			password: z.string({ required_error: "password is required" }),
			cpassword: z.string({ required_error: "cpassword is required" }),
			role: z.nativeEnum(UserRoles, { required_error: "role is required" }),
		})
		.refine(data => data.password === data.cpassword, {
			message: "password and cpassword must be the same",
		}),
});

export type TPostLoginSchema = z.infer<typeof postLoginSchema>;
