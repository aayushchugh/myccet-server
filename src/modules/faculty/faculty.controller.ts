import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostFacultyBody, PutFacultyBody } from "./faculty.schema";
import logger from "../../libs/logger";
import { Designation } from "../../db/schema/user";
import {
	createFaculty,
	getAllFaculty,
	getFacultyById,
	updateFaculty,
	deleteFaculty,
} from "../../services/faculty.service";

export async function postFacultyHandler(
	req: Request<{}, {}, PostFacultyBody>,
	res: Response
): Promise<void> {
	try {
		const {
			email,
			password,
			first_name,
			middle_name,
			last_name,
			phone,
			designation,
		} = req.body;

		// Create new faculty account
		await createFaculty({
			email: String(email),
			password: String(password),
			first_name: String(first_name),
			last_name: String(last_name),
			middle_name: middle_name ? String(middle_name) : undefined,
			phone: Number(phone),
			designation,
		});

		logger.info(`Faculty account created with email: ${email}`, "FACULTY");

		res.status(StatusCodes.CREATED).json({
			message: "Account created successfully",
		});
		return;
	} catch (err: any) {
		console.error(err);

		if (err.code === "23505") {
			if (err.constraint === "user_email_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: { email: "Account with same email already exists" },
				});
				return;
			}
			if (err.constraint === "user_phone_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: { phone: "Account with same phone already exists" },
				});
				return;
			}
		}

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getAllFacultyHandler(req: Request, res: Response) {
	try {
		const faculty = await getAllFaculty();

		res.status(StatusCodes.OK).json({
			message: "Faculty members fetched successfully",
			payload: faculty,
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getFacultyHandler(
	req: Request<{ id: string }>,
	res: Response
): Promise<void> {
	try {
		const { id } = req.params;

		const faculty = await getFacultyById(parseInt(id));

		if (!faculty) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Faculty member not found",
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Faculty member fetched successfully",
			payload: faculty,
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function deleteFacultyHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const success = await deleteFaculty(parseInt(id));

		if (!success) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Faculty member not found",
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Faculty member deleted successfully",
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function putFacultyHandler(
	req: Request<{ id: string }, {}, PutFacultyBody>,
	res: Response
): Promise<void> {
	try {
		const { id } = req.params;
		const { email, first_name, middle_name, last_name, designation, phone } =
			req.body;

		const updatedFaculty = await updateFaculty(parseInt(id), {
			email: email ? String(email) : undefined,
			first_name: first_name ? String(first_name) : undefined,
			middle_name: middle_name !== undefined ? String(middle_name) : null,
			last_name: last_name !== undefined ? String(last_name) : null,
			phone: phone ? Number(phone) : undefined,
			designation: designation as Designation,
		});

		if (!updatedFaculty) {
			res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: "Faculty member not found" });

			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Faculty member updated successfully",
		});
		return;
	} catch (err: any) {
		console.error(err);

		if (err.code === "23505") {
			if (err.constraint === "user_email_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: { email: "Account with same email already exists" },
				});
				return;
			}
			if (err.constraint === "user_phone_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: { phone: "Account with same phone already exists" },
				});
				return;
			}
		}

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}
