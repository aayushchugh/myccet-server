import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import db from "@/db";
import { sql } from "drizzle-orm";

export async function getHeathHandler(req: Request, res: Response) {
	try {
		const status = await db.execute(sql`select 1`);

		if (!status) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: "Database is not connected",
				status: StatusCodes.INTERNAL_SERVER_ERROR,
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			status: StatusCodes.OK,
			message: "Server is running",
		});
	} catch (err) {
		console.log(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
			status: StatusCodes.INTERNAL_SERVER_ERROR,
		});
	}
}
