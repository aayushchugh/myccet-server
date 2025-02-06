import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Role } from "../db/schema/user";

export async function requireRoleMiddleware(role: Role) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req.user;

			if (!user) {
				return res.status(StatusCodes.UNAUTHORIZED).json({
					error: "user must be logged in to access this route",
				});
			}

			if (user.role !== role) {
				return res.status(StatusCodes.FORBIDDEN).json({
					error: "user does not have the required role to access this route",
				});
			}

			next();
		} catch (err) {
			return res.status(StatusCodes.FORBIDDEN).json({
				error: "user does not have the required role to access this route",
			});
		}
	};
}
