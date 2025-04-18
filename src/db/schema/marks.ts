import { integer, pgTable, timestamp, boolean } from "drizzle-orm/pg-core";
import { studentTable } from "./user";
import { subjectTable } from "./subject";
import { semesterTable } from "./semester";
import { InferSelectModel } from "drizzle-orm";

export const studentMarksTable = pgTable("student_marks", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	student_id: integer()
		.notNull()
		.references(() => studentTable.id, { onDelete: "cascade" }),
	semester_id: integer()
		.notNull()
		.references(() => semesterTable.id, { onDelete: "cascade" }),
	subject_id: integer()
		.notNull()
		.references(() => subjectTable.id, { onDelete: "cascade" }),
	internal_marks: integer().notNull(),
	external_marks: integer().notNull(),
	total_marks: integer().notNull(),
	is_pass: boolean().notNull(),
	created_at: timestamp({ mode: "date" }).defaultNow(),
	updated_at: timestamp({ mode: "date" }).defaultNow(),
});

export type StudentMarks = InferSelectModel<typeof studentMarksTable>;
