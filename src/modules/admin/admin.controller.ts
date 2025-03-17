import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostAdminBody, PutAdminBody } from "./admin.schema";
import logger from "../../libs/logger";
import { Designation } from "../../db/schema/user";
import {
	createAdmin,
	getAllAdmins,
	getAdminById,
	updateAdmin,
	deleteAdmin,
} from "../../services/admin.service";

export async function postAdminHandler(
	req: Request<{}, {}, PostAdminBody>,
	res: Response
) {
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

		// Create new admin account
		await createAdmin({
			email: String(email),
			password: String(password),
			first_name: String(first_name),
			last_name: String(last_name),
			middle_name: middle_name ? String(middle_name) : undefined,
			phone: Number(phone),
			designation: designation as Designation,
		});

		logger.info(
			`Admin account created with email: ${email} by ${req.user?.id}`,
			"ADMIN"
		);

		res.status(StatusCodes.CREATED).json({
			message: "account created successfully",
		});

		return;
	} catch (err: any) {
		console.error(err);

		if (err.code === "23505") {
			if (err.constraint === "user_email_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						email: "account with same email already exists",
					},
				});

				return;
			}

			if (err.constraint === "user_phone_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						phone: "account with same phone already exists",
					},
				});

				return;
			}
		}

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getAllAdminsHandler(req: Request, res: Response) {
	try {
		const admins = await getAllAdmins();

		res.status(StatusCodes.OK).json({
			message: "admins fetched successfully",
			payload: admins,
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getAdminHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const admin = await getAdminById(parseInt(id));

		if (!admin) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Admin not found",
			});

			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Admin fetched successfully",
			payload: admin,
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

export async function deleteAdminHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const success = await deleteAdmin(parseInt(id));

		if (!success) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Admin not found",
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "admin deleted successfully",
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function putAdminHandler(
	req: Request<{ id: string }, {}, PutAdminBody>,
	res: Response
) {
	try {
		const { id } = req.params;
		const { email, first_name, middle_name, last_name, designation, phone } =
			req.body;

		const updatedAdmin = await updateAdmin(parseInt(id), {
			email: email ? String(email) : undefined,
			first_name: first_name ? String(first_name) : undefined,
			middle_name: middle_name !== undefined ? String(middle_name) : null,
			last_name: last_name !== undefined ? String(last_name) : null,
			phone: phone ? Number(phone) : undefined,
			designation: designation as Designation,
		});

		if (!updatedAdmin) {
			res.status(StatusCodes.NOT_FOUND).json({ message: "Admin not found" });
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Admin updated successfully",
		});
	} catch (err: any) {
		console.error(err);

		// Handle unique constraint errors for email and phone as done in the POST handler.
		if (err.code === "23505") {
			if (err.constraint === "user_email_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						email: "account with same email already exists",
					},
				});

				return;
			}

			if (err.constraint === "user_phone_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						phone: "account with same phone already exists",
					},
				});

				return;
			}
		}

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}
