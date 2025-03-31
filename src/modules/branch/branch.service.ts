import { eq } from "drizzle-orm";
import db from "../../db";
import { branchTable, Branch } from "../../db/schema/branch";
import logger from "../../libs/logger";

/**
 * Create a new branch
 */
export async function createBranch(data: { title: string }): Promise<Branch> {
	try {
		const [branch] = await db
			.insert(branchTable)
			.values({
				title: data.title,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning();

		logger.info(`Branch created with ID: ${branch.id}`, "SYSTEM");

		return branch;
	} catch (error) {
		logger.error(`Error creating branch: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Get all branches
 */
export async function getAllBranches(): Promise<Branch[]> {
	try {
		const branches = await db.select().from(branchTable);
		return branches;
	} catch (error) {
		logger.error(`Error fetching branches: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Get branch by ID
 */
export async function getBranchById(id: number): Promise<Branch | null> {
	try {
		const [branch] = await db
			.select()
			.from(branchTable)
			.where(eq(branchTable.id, id))
			.limit(1);

		return branch || null;
	} catch (error) {
		logger.error(`Error fetching branch: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Update branch
 */
export async function updateBranch(
	id: number,
	data: { title: string }
): Promise<Branch | null> {
	try {
		const [branch] = await db
			.update(branchTable)
			.set({
				title: data.title,
				updated_at: new Date(),
			})
			.where(eq(branchTable.id, id))
			.returning();

		if (!branch) {
			return null;
		}

		logger.info(`Branch updated with ID: ${branch.id}`, "SYSTEM");

		return branch;
	} catch (error) {
		logger.error(`Error updating branch: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Delete branch
 */
export async function deleteBranch(id: number): Promise<boolean> {
	try {
		const [branch] = await db
			.delete(branchTable)
			.where(eq(branchTable.id, id))
			.returning();

		if (!branch) {
			return false;
		}

		logger.info(`Branch deleted with ID: ${branch.id}`, "SYSTEM");

		return true;
	} catch (error) {
		logger.error(`Error deleting branch: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Check if branch exists
 */
export async function checkBranchExists(title: string): Promise<boolean> {
	try {
		const [branch] = await db
			.select()
			.from(branchTable)
			.where(eq(branchTable.title, title))
			.limit(1);

		return !!branch;
	} catch (error) {
		logger.error(`Error checking branch existence: ${error}`, "SYSTEM");
		throw error;
	}
}
