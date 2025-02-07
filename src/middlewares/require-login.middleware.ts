import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validateSessionToken } from "../modules/auth/auth.service";
import { Session } from "../db/schema/session";
import { User } from "../db/schema/user";

declare module "express-serve-static-core" {
	interface Request {
		session?: Session;
		user?: User;
	}
}

export async function requireLoginMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		// get session from cookie
		const sessionToken = req.headers.authorization;

		if (!sessionToken) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: "user must be logged in to access this route",
			});
			return;
		}

		// verify session
		const { session, user } = await validateSessionToken(sessionToken);

		if (!session || !user) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: "user must be logged in to access this route",
			});

			return;
		}

		req.session = session;
		req.user = user;

		next();
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.UNAUTHORIZED).json({
			message: "user must be logged in to access this route",
		});
	}
}
