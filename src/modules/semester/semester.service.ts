import { and, eq } from "drizzle-orm";
import db from "../../db";
import { semesterTable } from "../../db/schema/semester";
import logger from "../../libs/logger";
import { subjectSemesterBranchTable } from "../../db/schema/relation";
import { batchTable } from "../../db/schema/batch";
import { subjectTable } from "../../db/schema/subject";

/**
 * Create a new semester
 */
// export async function createSemester(data: {
// 	title: string;
// 	start_date: Date;
// 	end_date: Date;
// }) {
// 	try {
// 		const [semester] = await db
// 			.insert(semesterTable)
// 			.values({
// 				title: data.title,
// 				start_date: data.start_date,
// 				end_date: data.end_date,
// 				created_at: new Date(),
// 				updated_at: new Date(),
// 			})
// 			.returning();

// 		logger.info(`Semester created with ID: ${semester.id}`, "SYSTEM");

// 		return semester;
// 	} catch (error) {
// 		logger.error(`Error creating semester: ${error}`, "SYSTEM");
// 		throw error;
// 	}
// }

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

interface AddSemesterDetailsAndSubjectsPayload {
	semesters: {
		id: number;
		start_date: string;
		end_date: string;
		subject_ids: number[];
	}[];
	batchId: number;
}

export async function addSemesterDetailsAndSubjectsService({
	semesters,
	batchId,
}: AddSemesterDetailsAndSubjectsPayload) {
	try {
		const batch = await db
			.select()
			.from(batchTable)
			.where(eq(batchTable.id, batchId))
			.limit(1);

		if (!batch) {
			throw new Error("Batch not found");
		}

		await db.transaction(async tx => {
			// First, ensure all semesters exist
			const semesterCreationPromises = semesters.map(
				async (semester, index) => {
					// Check if semester exists
					const [existingSemester] = await tx
						.select()
						.from(semesterTable)
						.where(and(eq(semesterTable.batch_id, batchId)))
						.limit(1);

					if (!existingSemester) {
						// Create semester if it doesn't exist
						const [newSemester] = await tx
							.insert(semesterTable)
							.values({
								title: `Semester ${index + 1}`,
								batch_id: batchId,
								start_date: new Date(semester.start_date),
								end_date: new Date(semester.end_date),
								created_at: new Date(),
								updated_at: new Date(),
							})
							.returning();

						// Update the semester.id to match the newly created semester
						semester.id = newSemester.id;
					} else {
						// Update existing semester
						await tx
							.update(semesterTable)
							.set({
								start_date: new Date(semester.start_date),
								end_date: new Date(semester.end_date),
								updated_at: new Date(),
							})
							.where(
								and(
									eq(semesterTable.id, semester.id),
									eq(semesterTable.batch_id, batchId)
								)
							);
					}
				}
			);

			// Wait for all semester creations/updates to complete
			await Promise.all(semesterCreationPromises);

			// Now create subject-semester relationships
			const subjectPromises = semesters.flatMap(semester => {
				return semester.subject_ids.map(subjectId => {
					return tx.insert(subjectSemesterBranchTable).values({
						subject_id: subjectId,
						semester_id: semester.id,
						branch_id: batch[0].branch_id,
					});
				});
			});

			await Promise.all(subjectPromises);
		});
	} catch (err) {
		logger.error("Error adding semester details and subjects", "BATCH");
		throw err;
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

export async function getSemesterSubjects(semester_id: number) {
	try {
		const subjects = await db
			.select({
				id: subjectTable.id,
				title: subjectTable.title,
				code: subjectTable.code,
				internal_marks: subjectTable.internal_marks,
				external_marks: subjectTable.external_marks,
				internal_passing_marks: subjectTable.internal_passing_marks,
				external_passing_marks: subjectTable.external_passing_marks,
			})
			.from(subjectSemesterBranchTable)
			.innerJoin(
				subjectTable,
				eq(subjectSemesterBranchTable.subject_id, subjectTable.id)
			)
			.where(eq(subjectSemesterBranchTable.semester_id, semester_id));

		return subjects;
	} catch (error) {
		logger.error(`Error fetching semester subjects: ${error}`, "SYSTEM");
		throw error;
	}
}
