import { Request, Response } from "express";
import { TPostLoginSchema } from "./auth.schema";
import { StatusCodes } from "http-status-codes";

export const postLoginController = async (
	req: Request<{}, {}, TPostLoginSchema["body"]>,
	res: Response
) => {
	const { email, password } = req.body;

	return res.status(StatusCodes.OK).json({
		email,
		password,
	});
};
