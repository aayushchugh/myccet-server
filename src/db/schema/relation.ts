import {
	integer,
	pgTable,
	timestamp,
	boolean,
	unique,
} from "drizzle-orm/pg-core";
import { branchTable } from "./branch";
import { semesterTable } from "./semester";
import { subjectTable } from "./subject";
import { studentTable } from "./user";
import { InferSelectModel } from "drizzle-orm";
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

export const subjectSemesterBranchTable = pgTable(
	"subject_semester_branch",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		subject_id: integer()
			.notNull()
			.references(() => subjectTable.id, { onDelete: "cascade" }),
		semester_id: integer()
			.notNull()
			.references(() => semesterTable.id, { onDelete: "cascade" }),
		branch_id: integer()
			.notNull()
			.references(() => branchTable.id, { onDelete: "cascade" }),
		created_at: timestamp().notNull().defaultNow(),
		updated_at: timestamp().notNull().defaultNow(),
	},
	table => ({
		uniqueSubjectSemesterBranch: unique().on(
			table.subject_id,
			table.semester_id,
			table.branch_id
		),
	})
);

export const studentSemesterTable = pgTable("student_semester", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	student_id: integer()
		.notNull()
		.references(() => studentTable.id, { onDelete: "cascade" }),
	semester_id: integer()
		.notNull()
		.references(() => semesterTable.id, { onDelete: "cascade" }),
});

export const studentMarksTable = pgTable(
	"student_marks",
	{
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
		created_at: timestamp().notNull().defaultNow(),
		updated_at: timestamp().notNull().defaultNow(),
	},
	table => ({
		uniqueStudentSubject: unique().on(table.student_id, table.subject_id),
	})
);

export type StudentMarks = InferSelectModel<typeof studentMarksTable>;
