import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Session } from "../db/schema/session";
import { User } from "../db/schema/user";
import { getSessionByToken } from "../modules/auth/auth.service";
import { getUserById } from "../services/user.service";

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
		// get session from authorization header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: "user must be logged in to access this route",
			});
			return;
		}
		const sessionToken = authHeader.split(" ")[1];

		if (!sessionToken) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: "user must be logged in to access this route",
			});
			return;
		}

		// Get session by token
		const session = await getSessionByToken(sessionToken);

		if (!session) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: "Invalid or expired session",
			});
			return;
		}

		// Check if session is expired
		if (new Date() > session.expires_at) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: "Session expired",
			});
			return;
		}

		// Get user by ID
		const user = await getUserById(session.user_id);

		if (!user) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: "User not found",
			});
			return;
		}

		// Attach session and user to request
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
