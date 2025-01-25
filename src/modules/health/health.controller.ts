import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function getHeathHandler(req: Request, res: Response) {
	res.status(StatusCodes.OK).json({
		message: "Server is running",
	});
}
