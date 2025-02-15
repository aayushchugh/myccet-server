import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostLoginBody, PostSignupBody } from "./auth.schema";
import { userTable } from "../../db/schema/user";
import bcryptjs from "bcryptjs";
import db from "../../db";
import { eq } from "drizzle-orm";
import logger from "../../libs/logger";
import { createSession, generateSessionToken } from "./auth.service";
import { error } from "winston";

export async function postSignupHandler(
	req: Request<{}, {}, PostSignupBody>,
	res: Response
) {
	try {
		const {
			email,
			password,
			first_name,
			last_name,
			middle_name,
			phone,
			role,
			designation,
		} = req.body;

		// Check if admin already exists
		const admins = await db
			.select()
			.from(userTable)
			.where(eq(userTable.role, "admin"));

		if (admins.length) {
			res.status(StatusCodes.FORBIDDEN).json({
				message: "admin account already exists",
			});

			return;
		}

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
			role,
			designation,
			created_at: new Date(),
			updated_at: new Date(),
		});

		logger.info(`Admin account created with email: ${email}`, "AUTH");

		res.status(StatusCodes.CREATED).json({
			message: "account created successfully",
		});

		return;
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});

		return;
	}
}

export async function postLoginHandler(
	req: Request<{}, {}, PostLoginBody>,
	res: Response
) {
	try {
		const { email, password } = req.body;

		const user = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email));

		if (!user.length) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "user not found",
				errors: [{ email: "user not found" }],
			});

			return;
		}

		const isValid = await bcryptjs.compare(password, user[0].password);

		if (!isValid) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: "invalid password",
				errors: [{ password: "invalid password" }],
			});

			return;
		}

		// Create session
		const sessionToken = generateSessionToken();
		await createSession(sessionToken, user[0].id);

		logger.info(`User logged in with email: ${email}`, "AUTH");

		// set session in cookie
		res.status(StatusCodes.OK).json({
			message: "login successful",
			payload: {
				access_token: sessionToken,
			},
		});

		return;
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});

		return;
	}
}
