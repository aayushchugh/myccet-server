import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodSchema } from "zod";
import ErrorCodes from "../constants/errorCodes";

const validateRequestMiddleware = (schema: ZodSchema) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			});

			return next();
		} catch (err: any) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				statusCode: StatusCodes.BAD_REQUEST,
				error: {
					detail: err.errors[0].message,
					code: ErrorCodes.INVALID_REQUEST_BODY,
				},
			});
		}
	};
};

export default validateRequestMiddleware;
