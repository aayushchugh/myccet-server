import { eq } from "drizzle-orm";
import db from "../db";
import { semesterTable } from "../db/schema/semester";
import logger from "../libs/logger";

/**
 * Create a new semester
 */
export async function createSemester(data: {
	title: string;
	start_date: Date;
	end_date: Date;
}) {
	try {
		const [semester] = await db
			.insert(semesterTable)
			.values({
				title: data.title,
				start_date: data.start_date,
				end_date: data.end_date,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning();

		logger.info(`Semester created with ID: ${semester.id}`, "SYSTEM");

		return semester;
	} catch (error) {
		logger.error(`Error creating semester: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Get all semesters
 */
export async function getAllSemesters() {
	try {
		const semesters = await db
			.select()
			.from(semesterTable)
			.orderBy(semesterTable.created_at);

		return semesters;
	} catch (error) {
		logger.error(`Error fetching semesters: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Get semester by ID
 */
export async function getSemesterById(id: number) {
	try {
		const [semester] = await db
			.select()
			.from(semesterTable)
			.where(eq(semesterTable.id, id))
			.limit(1);

		return semester || null;
	} catch (error) {
		logger.error(`Error fetching semester: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Update semester
 */
export async function updateSemester(
	id: number,
	data: {
		title?: string;
		start_date?: Date;
		end_date?: Date;
	}
) {
	try {
		const [semester] = await db
			.update(semesterTable)
			.set({
				title: data.title,
				start_date: data.start_date,
				end_date: data.end_date,
				updated_at: new Date(),
			})
			.where(eq(semesterTable.id, id))
			.returning();

		if (!semester) {
			return null;
		}

		logger.info(`Semester updated with ID: ${semester.id}`, "SYSTEM");

		return semester;
	} catch (error) {
		logger.error(`Error updating semester: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Delete semester
 */
export async function deleteSemester(id: number) {
	try {
		const [semester] = await db
			.delete(semesterTable)
			.where(eq(semesterTable.id, id))
			.returning();

		if (!semester) {
			return false;
		}

		logger.info(`Semester deleted with ID: ${semester.id}`, "SYSTEM");

		return true;
	} catch (error) {
		logger.error(`Error deleting semester: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Check if semester exists
 */
export async function checkSemesterExists(title: string) {
	try {
		const [semester] = await db
			.select()
			.from(semesterTable)
			.where(eq(semesterTable.title, title))
			.limit(1);

		return !!semester;
	} catch (error) {
		logger.error(`Error checking semester existence: ${error}`, "SYSTEM");
		throw error;
	}
}
