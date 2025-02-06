import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostAdminBody } from "./admin.schema";
import bcryptjs from "bcryptjs";
import logger from "../../libs/logger";
import db from "../../db";
import { userTable, Role } from "../../db/schema/user";

export async function postAdminHandler(
	req: Request<{}, {}, PostAdminBody>,
	res: Response
) {
	try {
		const {
			email,
			password,
			first_name,
			middle_name,
			last_name,
			phone,
			designation,
		} = req.body;

		// Hash password
		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);

		// Create new admin account
		await db.insert(userTable).values({
			email,
			first_name,
			last_name,
			middle_name,
			phone,
			password: hashedPassword,
			role: Role.ADMIN,
			designation,
			created_at: new Date(),
			updated_at: new Date(),
		});

		logger.info(
			`Admin account created with email: ${email} by ${req.user?.id}`,
			"ADMIN"
		);

		res.status(StatusCodes.CREATED).json({
			message: "account created successfully",
		});

		return;
	} catch (err: any) {
		console.error(err);

		if (err.code === "23505") {
			if (err.constraint === "user_email_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						email: "account with same email already exists",
					},
				});

				return;
			}

			if (err.constraint === "user_phone_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						phone: "account with same phone already exists",
					},
				});

				return;
			}
		}

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			error: "Internal server error",
		});
	}
}
