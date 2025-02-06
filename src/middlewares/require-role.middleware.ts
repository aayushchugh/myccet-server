import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Role } from "../db/schema/user";

export function requireRoleMiddleware(role: Role) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = req.user;

			if (!user) {
				res.status(StatusCodes.UNAUTHORIZED).json({
					message: "user must be logged in to access this route",
				});

				return;
			}

			if (user.role !== role) {
				res.status(StatusCodes.FORBIDDEN).json({
					message: "user does not have the required role to access this route",
				});

				return;
			}

			next();
		} catch (err) {
			res.status(StatusCodes.FORBIDDEN).json({
				message: "user does not have the required role to access this route",
			});

			return;
		}
	};
}
