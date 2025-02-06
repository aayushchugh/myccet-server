import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostLoginBody, PostSignupBody } from "./auth.schema";
import { userTable } from "../../db/schema/user";
import bcryptjs from "bcryptjs";
import db from "../../db";
import { eq } from "drizzle-orm";
import logger from "../../libs/logger";
import { createSession, generateSessionToken } from "./auth.service";

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
				error: "admin account already exists",
			});
		}

		const hashedPassword = await bcryptjs.hash(password, 10);

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

		logger.info(`Admin account created with email: ${email}`, "SYSTEM");

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
				error: "user not found",
			});

			return;
		}

		const isValid = await bcryptjs.compare(password, user[0].password);

		if (!isValid) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				error: "invalid password",
			});

			return;
		}

		// Create session
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user[0].id);

		// set session in cookie
		res.cookie("session", sessionToken, {
			httpOnly: true,
			expires: session.expires_at,
		});

		res.status(StatusCodes.OK).json({
			message: "login successful",
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
