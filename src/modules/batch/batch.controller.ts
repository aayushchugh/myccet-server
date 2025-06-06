import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostBatchDetailsSchema, PostBatchSchema } from "./batch.schema";
import { deleteBatchService } from "./batch.service";
import { checkBatchExists } from "./batch.service";
import {
	createBatchService,
	getAllBatchService,
	getBatchService,
} from "./batch.service";
import logger from "../../libs/logger";
import { addSemesterDetailsAndSubjectsService } from "../semester/semester.service";

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

export async function postBatchDetailsHandler(
	req: Request<{ id: string }, {}, PostBatchDetailsSchema>,
	res: Response
) {
	try {
		const { id } = req.params;
		const { semesters } = req.body;

		// check if details of all semesters is provided
		// check it by using length

		await addSemesterDetailsAndSubjectsService({
			semesters,
			batchId: +id,
		});

		res.status(StatusCodes.OK).json({
			message: "Semester details added successfully",
		});

		return;
	} catch (err) {
		console.error(err);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
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
export async function deleteBatchHandler(
	req: Request<{ id: string }>,
	res: Response
): Promise<void> {
	try {
		const id = Number(req.params.id);

		if (isNaN(id)) {
			res.status(StatusCodes.BAD_REQUEST).json({
				message: "Invalid batch ID",
			});
			return;
		}

		const batch = await checkBatchExists(id); // <-- fix here

		if (!batch) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Batch not found",
			});
			return;
		}

		await deleteBatchService(id); // <-- actually delete

		res.status(StatusCodes.OK).json({
			message: "Batch deleted successfully",
		});
	} catch (err) {
		console.error(err);
		logger.error("Error deleting Batch", "BATCH");

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}
