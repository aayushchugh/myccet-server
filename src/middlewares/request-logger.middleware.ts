import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function requestLoggerMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
	} catch (err) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});

		return;
	}
}
