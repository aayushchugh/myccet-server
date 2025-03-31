import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import {
	PostCreateSemesterBody,
	PutUpdateSemesterBody,
} from "./semester.schema";
import logger from "../../libs/logger";
import {
	createSemester,
	getAllSemesters,
	getSemesterById,
	updateSemester,
	deleteSemester,
	checkSemesterExists,
} from "../../services/semester.service";

export async function postSemesterHandler(
	req: Request<{}, {}, PostCreateSemesterBody>,
	res: Response
) {
	try {
		const { title, start_date, end_date } = req.body;

		// Check if semester with same title already exists
		const exists = await checkSemesterExists(title);
		if (exists) {
			res.status(StatusCodes.CONFLICT).json({
				errors: {
					title: "semester with same title already exists",
				},
			});
			return;
		}

		// Create new semester
		await createSemester({
			title: String(title),
			start_date: new Date(start_date),
			end_date: new Date(end_date),
		});

		logger.info(
			`Semester created with title: ${title} by ${req.user?.id}`,
			"SYSTEM"
		);

		res.status(StatusCodes.CREATED).json({
			message: "semester created successfully",
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

export async function getAllSemestersHandler(req: Request, res: Response) {
	try {
		const semesters = await getAllSemesters();

		res.status(StatusCodes.OK).json({
			message: "semesters fetched successfully",
			payload: semesters,
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getSemesterHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const semester = await getSemesterById(parseInt(id));

		if (!semester) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Semester not found",
			});

			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Semester fetched successfully",
			payload: semester,
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

export async function deleteSemesterHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const success = await deleteSemester(parseInt(id));

		if (!success) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Semester not found",
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "semester deleted successfully",
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function putSemesterHandler(
	req: Request<{ id: string }, {}, PutUpdateSemesterBody>,
	res: Response
) {
	try {
		const { id } = req.params;
		const { title, start_date, end_date } = req.body;

		if (title) {
			// Check if semester with same title already exists
			const exists = await checkSemesterExists(title);
			if (exists) {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						title: "semester with same title already exists",
					},
				});
				return;
			}
		}

		const updatedSemester = await updateSemester(parseInt(id), {
			title: String(title),
			start_date: start_date ? new Date(start_date) : undefined,
			end_date: end_date ? new Date(end_date) : undefined,
		});

		if (!updatedSemester) {
			res.status(StatusCodes.NOT_FOUND).json({ message: "Semester not found" });
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Semester updated successfully",
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}
