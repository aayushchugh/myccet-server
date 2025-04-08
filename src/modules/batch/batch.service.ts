import db from "../../db";
import { batchTable, BatchType } from "../../db/schema/batch";
import { semesterTable } from "../../db/schema/semester";
import logger from "../../libs/logger";
import { PostBatchSchema } from "./batch.schema";

export async function createBatchService(payload: PostBatchSchema) {
	const { branch_id, end_year: endYear, start_year: startYear, type } = payload;

	try {
		const batch = await db.transaction(async tsx => {
			const numOfSems = BatchType?.REGULAR ? 6 : 8;

			const semsPromises = Array.from({ length: numOfSems }, (_, index) => {
				return tsx
					.insert(semesterTable)
					.values({
						title: (index + 1).toString(),
					})
					.returning({ id: semesterTable.id });
			});

			const semResults = await Promise.all(semsPromises);
			const semIds = semResults.map(result => result[0].id);
			const [sem_1, sem_2, sem_3, sem_4, sem_5, sem_6, sem_7, sem_8] = semIds;

			// create batch
			await tsx.insert(batchTable).values({
				branch_id,
				start_year: new Date(startYear),
				end_year: new Date(endYear),
				type,
				sem_1,
				sem_2,
				sem_3,
				sem_4,
				sem_5,
				sem_6,
				sem_7,
				sem_8,
			});
		});
	} catch (err) {
		console.log(err);
		logger.error("Error creating batch" + err, "BATCH");

		throw err;
	}
}
