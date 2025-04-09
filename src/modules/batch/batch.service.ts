import { eq } from "drizzle-orm";
import db from "../../db";
import { batchTable, BatchType } from "../../db/schema/batch";
import { semesterTable } from "../../db/schema/semester";
import logger from "../../libs/logger";
import { PostBatchSchema } from "./batch.schema";
import { batchSemesterTable } from "../../db/schema/relation";
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
					})
					.returning({ id: semesterTable.id });
			});

			const semResults = await Promise.all(semPromises);

			const batchSems = semResults.map(result => {
				return tsx.insert(batchSemesterTable).values({
					batch_id: newBatch.id,
					semester_id: result[0].id,
				});
			});

			await Promise.all(batchSems);
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
		console.log(err);
		logger.error("Error getting all batch from DB" + err, "BATCH");
		throw err;
	}
}
