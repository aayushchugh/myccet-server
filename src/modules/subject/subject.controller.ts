import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import {
	createSubject,
	getAllSubjects,
	getSubjectById,
	updateSubject,
	deleteSubject,
	checkSubjectExists,
} from "../../services/subject.service";
import { PostCreateSubjectBody, PutUpdateSubjectBody } from "./subject.schema";

export async function postCreateSubjectHandler(
	req: Request<{}, {}, PostCreateSubjectBody>,
	res: Response
) {
	try {
		const { title, code } = req.body;

		// Check if subject with same title or code already exists
		const exists = await checkSubjectExists(title, code);
		if (exists) {
			res.status(StatusCodes.CONFLICT).json({
				errors: {
					title: "subject with same title or code already exists",
				},
			});
			return;
		}

		// Create new subject
		await createSubject({
			title: String(title),
			code: String(code),
		});

		res.status(StatusCodes.CREATED).json({
			message: "subject created successfully",
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

export async function getAllSubjectsHandler(req: Request, res: Response) {
	try {
		const subjects = await getAllSubjects();

		res.status(StatusCodes.OK).json({
			message: "subjects fetched successfully",
			payload: subjects,
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getSubjectHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const subject = await getSubjectById(parseInt(id));

		if (!subject) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Subject not found",
			});

			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Subject fetched successfully",
			payload: subject,
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

export async function deleteSubjectHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const success = await deleteSubject(parseInt(id));

		if (!success) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Subject not found",
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "subject deleted successfully",
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function putSubjectHandler(
	req: Request<{ id: string }, {}, PutUpdateSubjectBody>,
	res: Response
) {
	try {
		const { id } = req.params;
		const { title, code } = req.body;

		// Check if subject with same title or code already exists
		const exists = await checkSubjectExists(title, code);
		if (exists) {
			res.status(StatusCodes.CONFLICT).json({
				errors: {
					title: "subject with same title or code already exists",
				},
			});
			return;
		}

		const updatedSubject = await updateSubject(parseInt(id), {
			title: title ? String(title) : undefined,
			code: code ? String(code) : undefined,
		});

		if (!updatedSubject) {
			res.status(StatusCodes.NOT_FOUND).json({ message: "Subject not found" });
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Subject updated successfully",
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}
