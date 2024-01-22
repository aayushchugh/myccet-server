import { Request, Response } from "express";
import { TPostLoginSchema } from "./auth.schema";
import { StatusCodes } from "http-status-codes";
import { getUserByEmailService } from "../user/user.service";
import ErrorCodes from "../../common/constants/errorCodes";
import {
	checkUserPasswordService,
	signAccessTokenService,
} from "./auth.service";
import loggerUtil from "../../common/utils/logger.util";

export const postLoginController = async (
	req: Request<{}, {}, TPostLoginSchema["body"]>,
	res: Response
) => {
	const { email, password } = req.body;

	loggerUtil.info(`User login attempt for ${email} from ${req.ip}`);

	try {
		// get user from db
		const userFromDb = await getUserByEmailService(email);

		if (!userFromDb) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				success: false,
				statusCode: StatusCodes.UNAUTHORIZED,
				error: {
					detail: "Invalid credentials",
					code: ErrorCodes.USER_INVALID_CREDENTIALS,
				},
			});
		}

		// check if password is correct
		const isPasswordCorrect = await checkUserPasswordService(
			password,
			userFromDb
		);

		if (!isPasswordCorrect) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				success: false,
				statusCode: StatusCodes.UNAUTHORIZED,
				error: {
					detail: "Invalid credentials",
					code: ErrorCodes.USER_INVALID_CREDENTIALS,
				},
			});
		}

		// create access token for user
		const accessToken = signAccessTokenService(userFromDb);

		// return user
		loggerUtil.info(
			`User ${userFromDb.id} with email ${userFromDb.email} logged in form ${req.ip}`
		);

		return res.status(StatusCodes.OK).json({
			success: true,
			statusCode: StatusCodes.OK,
			data: {
				accessToken,
			},
		});
	} catch (err) {
		console.log(err);
		loggerUtil.error(err);

		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			success: false,
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			error: {
				detail: "Internal server error",
				code: ErrorCodes.INTERNAL_SERVER_ERROR,
			},
		});
	}
};
