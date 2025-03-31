import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import logger from "../../libs/logger";
import {
	createBranch,
	getAllBranches,
	getBranchById,
	updateBranch,
	deleteBranch,
	checkBranchExists,
} from "../../services/branch.service";
import { PostCreateBranchBody, PutUpdateBranchBody } from "./branch.schema";

export async function postBranchHandler(
	req: Request<{}, {}, PostCreateBranchBody>,
	res: Response
) {
	try {
		const { title } = req.body;

		// Check if branch with same title already exists
		const exists = await checkBranchExists(title);
		if (exists) {
			res.status(StatusCodes.CONFLICT).json({
				errors: {
					title: "branch with same title already exists",
				},
			});
			return;
		}

		// Create new branch
		await createBranch({
			title: String(title),
		});

		logger.info(
			`Branch created with title: ${title} by ${req.user?.id}`,
			"SYSTEM"
		);

		res.status(StatusCodes.CREATED).json({
			message: "branch created successfully",
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

export async function getAllBranchesHandler(req: Request, res: Response) {
	try {
		const branches = await getAllBranches();

		res.status(StatusCodes.OK).json({
			message: "branches fetched successfully",
			payload: branches,
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function getBranchHandler(
	req: Request<{ id: string }>,
	res: Response
) {
	try {
		const { id } = req.params;

		const branch = await getBranchById(parseInt(id));

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
			message: "Internal server error",
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

		const success = await deleteBranch(parseInt(id));

		if (!success) {
			res.status(StatusCodes.NOT_FOUND).json({
				message: "Branch not found",
			});
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "branch deleted successfully",
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}

export async function putBranchHandler(
	req: Request<{ id: string }, {}, PutUpdateBranchBody>,
	res: Response
) {
	try {
		const { id } = req.params;
		const { title } = req.body;

		// Check if branch with same title already exists
		const exists = await checkBranchExists(title);
		if (exists) {
			res.status(StatusCodes.CONFLICT).json({
				errors: {
					title: "branch with same title already exists",
				},
			});
			return;
		}

		const updatedBranch = await updateBranch(parseInt(id), {
			title: String(title),
		});

		if (!updatedBranch) {
			res.status(StatusCodes.NOT_FOUND).json({ message: "Branch not found" });
			return;
		}

		res.status(StatusCodes.OK).json({
			message: "Branch updated successfully",
		});
	} catch (err) {
		console.error(err);

		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: "Internal server error",
		});
	}
}
