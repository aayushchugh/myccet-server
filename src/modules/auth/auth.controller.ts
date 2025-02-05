import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostAdminSignupBody } from "./auth.schema";
import { adminTable } from "../../db/schema/admin";
import bcryptjs from "bcryptjs";
import db from "../../db";

export async function postAdminSignupHandler(
	req: Request<{}, {}, PostAdminSignupBody>,
	res: Response
) {
	try {
		const { email, password, first_name, last_name, middle_name, phone } =
			req.body;

		// Check if admin already exists
		const admins = await db.select().from(adminTable);

		if (admins.length) {
			res.status(StatusCodes.FORBIDDEN).json({
				error: "admin account already exists",
			});
		}

		const hashedPassword = await bcryptjs.hash(password, 10);

		// Create new admin account
		await db.insert(adminTable).values({
			email,
			first_name,
			last_name,
			middle_name,
			phone,
			password: hashedPassword,
			created_at: new Date(),
			updated_at: new Date(),
		});

		res.status(StatusCodes.CREATED).json({
			message: "account created successfully",
		});

		return;
	} catch (err) {
		console.log(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});

		return;
	}
}
