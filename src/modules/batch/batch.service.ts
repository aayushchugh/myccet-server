import { eq } from "drizzle-orm";
import db from "../../db";
import { batchTable, BatchType } from "../../db/schema/batch";
import { semesterTable } from "../../db/schema/semester";
import logger from "../../libs/logger";
import { PostBatchSchema } from "./batch.schema";
import { branchTable } from "../../db/schema/branch";

export async function createBatchService(payload: PostBatchSchema) {
	const { branch_id, end_year: endYear, start_year: startYear, type } = payload;

	try {
		const batch = await db.transaction(async tsx => {
			// create batch
			const [newBatch] = await tsx
				.insert(batchTable)
				.values({
					branch_id,
					start_year: new Date(startYear),
					end_year: new Date(endYear),
					type,
				})
				.returning();

			// create sems
			const numOfSems = BatchType?.REGULAR ? 6 : 8;

			const semPromises = Array.from({ length: numOfSems }, (_, index) => {
				return tsx
					.insert(semesterTable)
					.values({
						title: (index + 1).toString(),
						batch_id: newBatch.id,
					})
					.returning({ id: semesterTable.id });
			});

			await Promise.all(semPromises);
		});

		return batch;
	} catch (err) {
		console.log(err);
		logger.error("Error creating batch" + err, "BATCH");

		throw err;
	}
}

export async function getAllBatchService() {
	try {
		const results = db
			.select({
				id: batchTable.id,
				start_year: batchTable.start_year,
				end_year: batchTable.end_year,
				branch: branchTable.title,
				type: batchTable.type,
			})
			.from(batchTable)
			.innerJoin(branchTable, eq(batchTable.branch_id, branchTable.id));

		return results;
	} catch (err) {
		console.error(err);
		logger.error("Error getting all batch from DB" + err, "BATCH");
		throw err;
	}
}

export async function getBatchService(id: number) {
	try {
		const [batch] = await db
			.select({
				id: batchTable.id,
				start_year: batchTable.start_year,
				end_year: batchTable.end_year,
				branch: branchTable.title,
				type: batchTable.type,
			})
			.from(batchTable)
			.where(eq(batchTable.id, id))
			.innerJoin(branchTable, eq(batchTable.branch_id, branchTable.id));

		const semesters = await db
			.select({
				id: semesterTable.id,
				title: semesterTable.title,
				start_date: semesterTable.start_date,
				end_date: semesterTable.end_date,
			})
			.from(semesterTable)
			.where(eq(semesterTable.batch_id, id));

		const result = {
			...batch,
			semesters,
		};

		return result;
	} catch (err) {
		console.error(err);
		logger.error("Error getting single batch from DB" + err, "BATCH");
		return;
	}
}
