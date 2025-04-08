import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const semesterTable = pgTable("semester", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull(),
	start_date: timestamp({ mode: "date" }),
	end_date: timestamp({ mode: "date" }),
	created_at: timestamp({ mode: "date" }).defaultNow(),
	updated_at: timestamp({ mode: "date" }).defaultNow(),
});

export type Semester = InferSelectModel<typeof semesterTable>;
