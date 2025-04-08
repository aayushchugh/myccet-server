import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { branchTable } from "./branch";
import { InferSelectModel } from "drizzle-orm";
import { semesterTable } from "./semester";

export enum BatchType {
	REGULAR = "regular",
	PTD = "ptd",
}

export const batchTable = pgTable("batch", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	start_year: timestamp({ mode: "date" }),
	end_year: timestamp({ mode: "date" }),
	branch_id: integer()
		.notNull()
		.references(() => branchTable.id, { onDelete: "cascade" }),
	sem_1: integer()
		.notNull()
		.references(() => semesterTable.id, {
			onDelete: "cascade",
		}),
	sem_2: integer()
		.notNull()
		.references(() => semesterTable.id, {
			onDelete: "cascade",
		}),
	sem_3: integer()
		.notNull()
		.references(() => semesterTable.id, {
			onDelete: "cascade",
		}),
	sem_4: integer()
		.notNull()
		.references(() => semesterTable.id, {
			onDelete: "cascade",
		}),
	sem_5: integer()
		.notNull()
		.references(() => semesterTable.id, {
			onDelete: "cascade",
		}),
	sem_6: integer()
		.notNull()
		.references(() => semesterTable.id, {
			onDelete: "cascade",
		}),
	sem_7: integer().references(() => semesterTable.id, {
		onDelete: "cascade",
	}),
	sem_8: integer().references(() => semesterTable.id, {
		onDelete: "cascade",
	}),
	type: varchar({ length: 255 }).default(BatchType.REGULAR).notNull(),
	created_at: timestamp({ mode: "date" }).defaultNow(),
	updated_at: timestamp({ mode: "date" }).defaultNow(),
});

export type Batch = InferSelectModel<typeof batchTable>;
