import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { branchTable } from "./branch";
import { semesterTable } from "./semester";
import { subjectTable } from "./subject";
import { studentTable } from "./user";
import { InferSelectModel, relations } from "drizzle-orm";
import { batchTable } from "./batch";

export const semesterBranchTable = pgTable("semester_branch", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	semester_id: integer()
		.notNull()
		.references(() => semesterTable.id, { onDelete: "cascade" }),
	branch_id: integer()
		.notNull()
		.references(() => branchTable.id, { onDelete: "cascade" }),
});

export const semesterSubjectTable = pgTable("semester_subject", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	semester_id: integer()
		.notNull()
		.references(() => semesterTable.id, { onDelete: "cascade" }),
	subject_id: integer()
		.notNull()
		.references(() => subjectTable.id, { onDelete: "cascade" }),
});

export const studentSemesterTable = pgTable("student_semester", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	student_id: integer()
		.notNull()
		.references(() => studentTable.id, { onDelete: "cascade" }),
	semester_id: integer()
		.notNull()
		.references(() => semesterTable.id, { onDelete: "cascade" }),
});

export const examMarksTable = pgTable("exam_marks", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	student_id: integer()
		.notNull()
		.references(() => studentTable.id, { onDelete: "cascade" }),
	subject_id: integer()
		.notNull()
		.references(() => subjectTable.id, { onDelete: "cascade" }),
	internal_marks: integer().notNull().default(0),
	external_marks: integer().notNull().default(0),
	created_at: timestamp({ mode: "date" }).defaultNow(),
	updated_at: timestamp({ mode: "date" }).defaultNow(),
});

export type ExamMarks = InferSelectModel<typeof examMarksTable>;
