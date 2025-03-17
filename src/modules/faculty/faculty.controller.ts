import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostFacultyBody, PutFacultyBody } from "./faculty.schema";
import bcryptjs from "bcryptjs";
import logger from "../../libs/logger";
import db from "../../db";
import { userTable, Role } from "../../db/schema/user";
import { and, eq, isNull } from "drizzle-orm";

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

		// Hash password
		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);

		// Create new faculty account
		await db.insert(userTable).values({
			email,
			first_name,
			last_name,
			middle_name,
			phone: Number(phone),
			password: hashedPassword,
			role: Role.FACULTY,
			designation,
			created_at: new Date(),
			updated_at: new Date(),
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
		const faculty = await db
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
			.where(
				and(eq(userTable.role, Role.FACULTY), isNull(userTable.deleted_at))
			);
		console.log("Faculty Data:", faculty);

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

		const [faculty] = await db
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

		await db
			.update(userTable)
			.set({ deleted_at: new Date() })
			.where(eq(userTable.id, parseInt(id)));

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
					eq(userTable.role, Role.FACULTY),
					isNull(userTable.deleted_at)
				)
			)
			.returning();

		if (updateResult.length === 0) {
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

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}
