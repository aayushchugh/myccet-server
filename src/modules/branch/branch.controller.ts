import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import db from "@/db";
import { branchTable } from "@/db/schema/branch";
import { and, eq, isNull } from "drizzle-orm";
import { PostCreateBranchBody, PutUpdateBranchBody } from "./branch.schema";

export async function postCreateBranchHandler(
	req: Request<{}, {}, PostCreateBranchBody>,
	res: Response
) {
	try {
		const { title } = req.body;

		// Insert a new branch record
		await db.insert(branchTable).values({ title });

		res.status(StatusCodes.CREATED).json({
			message: "Branch created successfully",
		});
		return;
	} catch (err: any) {
		console.error(err);

		if (err.code === "23505") {
			if (err.constraint === "branch_title_unique") {
				res.status(StatusCodes.CONFLICT).json({
					errors: {
						email: "Branch with same Title already exists",
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

export async function getAllBranchHandler(req: Request, res: Response) {
	try {
		const branches = await db
			.select({
				id: branchTable.id,
				title: branchTable.title,
				created_at: branchTable.created_at,
				updated_at: branchTable.updated_at,
			})
			.from(branchTable)
			.where(isNull(branchTable.deleted_at));

		res.status(StatusCodes.OK).json({
			message: "Branches fetched successfully",
			payload: branches,
		});
		return;
	} catch (err) {
		console.error(err);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal Server Error",
		});
		return;
	}
}

export async function getSingleBranchHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const [branch] = await db
			.select({
				id: branchTable.id,
				title: branchTable.title,
				created_at: branchTable.created_at,
				updated_at: branchTable.updated_at,
			})
			.from(branchTable)
			.where(and(eq(branchTable.id, +id), isNull(branchTable.deleted_at)));

		if (!branch) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Branch not found",
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Branch fetched successfully",
			payload: branch,
		});
		return;
	} catch (err) {
		console.error(err);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal Server Error",
		});
		return;
	}
}

export async function putBranchHandler(
	req: Request<{ id: string }, {}, PutUpdateBranchBody>,
	res: Response
) {
	try {
		const { id } = req.params;
		const { title } = req.body;

		await db
			.update(branchTable)
			.set({
				title,
				updated_at: new Date(),
			})
			.where(and(eq(branchTable.id, +id), isNull(branchTable.deleted_at)));

		res.status(StatusCodes.OK).json({
			message: "Branch updated successfully",
		});
		return;
	} catch (err) {
		console.error(err);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal Server Error",
		});
		return;
	}
}

export async function deleteBranchHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		await db
			.update(branchTable)
			.set({ deleted_at: new Date() })
			.where(eq(branchTable.id, +id));

		res.status(StatusCodes.OK).json({
			message: "Branch deleted successfully",
		});
		return;
	} catch (err) {
		console.error(err);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal Server Error",
		});
		return;
	}
}
