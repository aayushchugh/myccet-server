import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const subjectTable = pgTable("subject", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 255 }).notNull().unique(),
	internal_marks: integer().notNull().default(50), // Total internal marks possible
	external_marks: integer().notNull().default(50), // Total external marks possible
	internal_passing_marks: integer().notNull().default(20), // Default 40% of 50
	external_passing_marks: integer().notNull().default(20), // Default 40% of 50
	created_at: timestamp({ mode: "date" }).defaultNow(),
	updated_at: timestamp({ mode: "date" }).defaultNow(),
});

export type Subject = InferSelectModel<typeof subjectTable>;
