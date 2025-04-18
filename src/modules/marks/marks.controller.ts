import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import {
	deleteStudentSemesterMarks,
	getStudentSemesterMarks,
	getStudentSemesters,
	createStudentMarks,
	updateStudentMarks,
} from "./marks.service";
import { postMarksSchema, getMarksSchema } from "./marks.schema";

export async function postMarksHandler(
	req: Request<{}, {}, z.infer<typeof postMarksSchema>>,
	res: Response
) {
	try {
		const marks = await createStudentMarks(req.body);

		res.status(StatusCodes.CREATED).json({
			message: "Marks created successfully",
			payload: marks,
		});
	} catch (error: any) {
		console.error(error);

		switch (error.code) {
			case "INTERNAL_MARKS_EXCEEDED":
			case "EXTERNAL_MARKS_EXCEEDED":
				res.status(StatusCodes.BAD_REQUEST).json({
					message: error.message,
				});
				break;

			case "SUBJECT_NOT_FOUND":
			case "STUDENT_NOT_FOUND":
			case "SEMESTER_NOT_FOUND":
				res.status(StatusCodes.NOT_FOUND).json({
					message: error.message,
				});
				break;

			case "MARKS_ALREADY_EXIST":
				res.status(StatusCodes.CONFLICT).json({
					message: error.message,
				});
				break;

			default:
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					message: "Internal server error",
				});
		}
	}
}

export async function putMarksHandler(
	req: Request<{ id: string }, {}, z.infer<typeof postMarksSchema>>,
	res: Response
) {
	try {
		const { internal_marks, external_marks } = req.body;
		const marks = await updateStudentMarks(parseInt(req.params.id), {
			internal_marks,
			external_marks,
		});

		res.status(StatusCodes.OK).json({
			message: "Marks updated successfully",
			payload: marks,
		});
	} catch (error: any) {
		console.error(error);

		switch (error.code) {
			case "INTERNAL_MARKS_EXCEEDED":
			case "EXTERNAL_MARKS_EXCEEDED":
				res.status(StatusCodes.BAD_REQUEST).json({
					message: error.message,
				});
				break;

			case "SUBJECT_NOT_FOUND":
			case "STUDENT_NOT_FOUND":
			case "SEMESTER_NOT_FOUND":
			case "MARKS_NOT_FOUND":
				res.status(StatusCodes.NOT_FOUND).json({
					message: error.message,
				});
				break;

			default:
				res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
					message: "Internal server error",
				});
		}
	}
}

export async function getStudentSemestersHandler(
	req: Request<{ student_id: string }>,
	res: Response
) {
	try {
		const semesters = await getStudentSemesters(
			parseInt(req.params.student_id)
		);

		res.status(StatusCodes.OK).json({
			message: "Semesters fetched successfully",
			payload: semesters,
		});
	} catch (error: any) {
		console.error(error);

		if (error.message === "Student not found") {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Student not found",
			});
			return;
		}

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getSemesterMarksHandler(
	req: Request<z.infer<typeof getMarksSchema>>,
	res: Response
) {
	try {
		const { student_id, semester_id } = req.params;

		const marks = await getStudentSemesterMarks(student_id, semester_id);

		res.status(StatusCodes.OK).json({
			message: "Marks fetched successfully",
			payload: marks,
		});
	} catch (error) {
		console.error(error);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function deleteSemesterMarksHandler(
	req: Request<z.infer<typeof getMarksSchema>>,
	res: Response
) {
	try {
		const { student_id, semester_id } = req.params;

		await deleteStudentSemesterMarks(student_id, semester_id);

		res.status(StatusCodes.OK).json({
			message: "Marks deleted successfully",
		});
	} catch (error) {
		console.error(error);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}
