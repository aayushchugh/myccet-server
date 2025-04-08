import { Request, Response } from "express";
import { PostMarksBodySchema } from "./marks.schema";
import { StatusCodes } from "http-status-codes";
import { createMarksService } from "./marks.service";

export async function postMarksHandler(
	req: Request<{}, {}, PostMarksBodySchema>,
	res: Response
) {
	try {
		const { subject_id, student_id, external_marks, internal_marks } = req.body;

		await createMarksService({
			subject_id,
			student_id,
			external_marks,
			internal_marks,
		});

		res.status(StatusCodes.CREATED).json({
			message: "Marks created successfully",
		});
	} catch (err) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
		return;
	}
}

export async function getSemesterMarksHandler(
	req: Request<{
		id: string;
		semester_id: string;
	}>,
	res: Response
) {
	try {
		/**
		 * Get all subjects for provided semester linked with students
		 */

		const { id, semester_id } = req.params;

		res.status(StatusCodes.OK).json({
			message: "marks retrieved successfully",
		});

		return;
	} catch (err) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});

		return;
	}
}
