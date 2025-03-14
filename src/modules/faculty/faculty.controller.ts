import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostAdminBody, PutAdminBody } from "./faculty.schema";
import bcryptjs from "bcryptjs";
import logger from "../../libs/logger";
import db from "../../db";
import { userTable, Role } from "../../db/schema/user";
import { and, eq, isNull } from "drizzle-orm";

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

		// Hash password
		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);

		// Create new admin account
		await db.insert(userTable).values({
			email,
			first_name,
			last_name,
			middle_name,
			phone,
			password: hashedPassword,
			role: Role.ADMIN,
			designation,
			created_at: new Date(),
			updated_at: new Date(),
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
		const admins = await db
			.select({
				id: userTable.id,
				email: userTable.email,
				first_name: userTable.first_name,
				middle_name: userTable.middle_name,
				last_name: userTable.last_name,
				phone: userTable.phone,
				designation: userTable.designation,
			})
			.from(userTable)
			.where(and(eq(userTable.role, Role.ADMIN), isNull(userTable.deleted_at)));

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

		const [admin] = await db
			.select({
				id: userTable.id,
				email: userTable.email,
				first_name: userTable.first_name,
				middle_name: userTable.middle_name,
				last_name: userTable.last_name,
				phone: userTable.phone,
				designation: userTable.designation,
			})
			.from(userTable)
			.where(eq(userTable.id, +id));

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
		console.log(id);

		await db
			.update(userTable)
			.set({ deleted_at: new Date() })
			.where(eq(userTable.id, parseInt(id)));

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

		// Update the admin account, setting the new fields along with the updated_at timestamp.
		const updateResult = await db
			.update(userTable)
			.set({
				email,
				first_name,
				middle_name,
				last_name,
				phone,
				designation,
				updated_at: new Date(),
			})
			.where(
				and(
					eq(userTable.id, parseInt(id)),
					eq(userTable.role, Role.ADMIN),
					isNull(userTable.deleted_at)
				)
			)
			.returning({
				id: userTable.id,
				email: userTable.email,
				first_name: userTable.first_name,
				middle_name: userTable.middle_name,
				last_name: userTable.last_name,
				phone: userTable.phone,
				designation: userTable.designation,
			});

		// If no record is updated, then no matching admin was found.
		if (updateResult.length === 0) {
			res.status(StatusCodes.NOT_FOUND).json({ message: "Admin not found" });

			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Admin updated successfully",
			payload: updateResult[0],
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
