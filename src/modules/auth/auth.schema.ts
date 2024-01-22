import { z } from "zod";

export const postLoginSchema = z.object({
	body: z.object({
		email: z
			.string({ required_error: "email is required" })
			.email({ message: "email is not valid" }),
		password: z.string({ required_error: "password is required" }),
	}),
});

export type TPostLoginSchema = z.infer<typeof postLoginSchema>;
