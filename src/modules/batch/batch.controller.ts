import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostBatchSchema } from "./batch.schema";
import db from "../../db";
import {
	createBatchService,
	getAllBatchService,
	getBatchService,
} from "./batch.service";
import logger from "../../libs/logger";

export async function postBatchHandler(
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
	} catch (err: any) {
		if (err && err.code === "23503") {
			if (err.constraint === "batch_branch_id_branch_id_fk") {
				res.status(StatusCodes.BAD_REQUEST).json({
					message: "Error creating batch",
					errors: {
						branch_id: "Branch doesn't exists",
					},
				});

				return;
			}
		}

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server Error",
		});

		return;
	}
}

export async function getAllBatchHandler(req: Request, res: Response) {
	try {
		const results = await getAllBatchService();

		res.status(StatusCodes.OK).json({
			message: "Batch fetched successfully",
			payload: results,
		});
		return;
	} catch (err) {
		console.error(err);
		logger.error("Error getting all Batch", "BATCH");

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});

		return;
	}
}

export async function getBatchHandler(
	req: Request<{ id: number }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const batch = await getBatchService(id);

		res.status(StatusCodes.OK).json({
			message: "Batch fetched successfully",
			payload: batch,
		});

		return;
	} catch (err) {
		console.error(err);
		logger.error("Error getting single Batch", "BATCH");

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});

		return;
	}
}
