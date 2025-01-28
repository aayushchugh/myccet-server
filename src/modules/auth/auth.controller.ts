import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function postAdminSignupHandler(req: Request, res: Response) {
	try {
	} catch (err) {
		console.log(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
			status: StatusCodes.INTERNAL_SERVER_ERROR,
		});

		return;
	}
}
