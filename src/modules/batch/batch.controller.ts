import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostBatchSchema } from "./batch.schema";
import db from "../../db";
import { createBatchService } from "./batch.service";

export async function PostBatchHandler(
	req: Request<{}, {}, PostBatchSchema>,
	res: Response
) {
	try {
		const { branch_id, end_year, start_year, type } = req.body;
		await createBatchService({
			branch_id,
			end_year,
			start_year,
			type,
		});

		res.status(StatusCodes.CREATED).json({
			message: "Batch created successfully",
		});

		return;
	} catch (err) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server Error",
		});

		return;
	}
}
