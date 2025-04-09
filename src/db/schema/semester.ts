import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { batchTable } from "./batch";

export const semesterTable = pgTable("semester", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull(),
	batch_id: integer()
		.notNull()
		.references(() => batchTable.id, {
			onDelete: "cascade",
		}),
	start_date: timestamp({ mode: "date" }),
	end_date: timestamp({ mode: "date" }),
	created_at: timestamp({ mode: "date" }).defaultNow(),
	updated_at: timestamp({ mode: "date" }).defaultNow(),
});

export type Semester = InferSelectModel<typeof semesterTable>;
