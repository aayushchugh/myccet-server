import db from "@/db";
import { studentMarksTable } from "@/db/schema/relation";
import { eq, and, sql } from "drizzle-orm";
import logger from "@/libs/logger";
import { subjectTable } from "@/db/schema/subject";
import { semesterTable } from "@/db/schema/semester";
import { studentTable, userTable, User } from "@/db/schema/user";

async function validateAndGetEntities(data: {
	student_id: number;
	semester_id: number;
	subject_id: number;
	internal_marks: number;
	external_marks: number;
}) {
	// Get subject to check passing marks
	const [subject] = await db
		.select({
			id: subjectTable.id,
			title: subjectTable.title,
			code: subjectTable.code,
			internal_marks: subjectTable.internal_marks,
			external_marks: subjectTable.external_marks,
			internal_passing_marks: subjectTable.internal_passing_marks,
			external_passing_marks: subjectTable.external_passing_marks,
		})
		.from(subjectTable)
		.where(eq(subjectTable.id, data.subject_id));

	if (!subject) {
		return { error: "SUBJECT_NOT_FOUND" };
	}

	// Validate marks don't exceed subject's total marks
	if (data.internal_marks > subject.internal_marks) {
		return { error: "INTERNAL_MARKS_EXCEEDED" };
	}
	if (data.external_marks > subject.external_marks) {
		return { error: "EXTERNAL_MARKS_EXCEEDED" };
	}

	// Verify if student exists
	const [student] = await db
		.select({
			id: studentTable.id,
			first_name: userTable.first_name,
			last_name: userTable.last_name,
		})
		.from(studentTable)
		.innerJoin(userTable, eq(studentTable.user_id, userTable.id))
		.where(eq(studentTable.id, data.student_id));

	if (!student) {
		return { error: "STUDENT_NOT_FOUND" };
	}

	// Verify if semester exists
	const [semester] = await db
		.select()
		.from(semesterTable)
		.where(eq(semesterTable.id, data.semester_id));

	if (!semester) {
		return { error: "SEMESTER_NOT_FOUND" };
	}

	return { subject, student, semester };
}

/**
 * Create marks for a student in a semester for a subject
 */
export async function createStudentMarks(data: {
	student_id: number;
	semester_id: number;
	subject_id: number;
	internal_marks: number;
	external_marks: number;
}) {
	try {
		const result = await validateAndGetEntities(data);

		if ("error" in result) {
			return { error: result.error };
		}

		const { subject, student, semester } = result;

		// Check if marks already exist
		const [existingMarks] = await db
			.select()
			.from(studentMarksTable)
			.where(
				and(
					eq(studentMarksTable.student_id, data.student_id),
					eq(studentMarksTable.semester_id, data.semester_id),
					eq(studentMarksTable.subject_id, data.subject_id)
				)
			);

		if (existingMarks) {
			return { error: "MARKS_ALREADY_EXIST" };
		}

		// Calculate total marks and pass status
		const total_marks = data.internal_marks + data.external_marks;
		const is_pass =
			data.internal_marks >= subject.internal_passing_marks &&
			data.external_marks >= subject.external_passing_marks;

		// Insert new marks
		const [marks] = await db
			.insert(studentMarksTable)
			.values({
				student_id: data.student_id,
				semester_id: data.semester_id,
				subject_id: data.subject_id,
				internal_marks: data.internal_marks,
				external_marks: data.external_marks,
				total_marks,
				is_pass,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning();

		logger.info(
			`Added marks for student ${student.first_name} ${student.last_name} in semester ${semester.title} for subject ${subject.title}`,
			"SYSTEM"
		);

		return {
			data: {
				...marks,
				student,
				subject,
				semester,
			},
		};
	} catch (error) {
		logger.error(`Error creating student marks: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Update marks for a student in a semester for a subject
 */
export async function updateStudentMarks(
	id: number,
	data: {
		internal_marks: number;
		external_marks: number;
	}
) {
	try {
		// Get existing marks
		const [existingMarks] = await db
			.select()
			.from(studentMarksTable)
			.where(eq(studentMarksTable.id, id));

		if (!existingMarks) {
			return { error: "MARKS_NOT_FOUND" };
		}

		const result = await validateAndGetEntities({
			...data,
			student_id: existingMarks.student_id,
			semester_id: existingMarks.semester_id,
			subject_id: existingMarks.subject_id,
		});

		if ("error" in result) {
			return { error: result.error };
		}

		const { subject, student, semester } = result;

		// Calculate total marks and pass status
		const total_marks = data.internal_marks + data.external_marks;
		const is_pass =
			data.internal_marks >= subject.internal_passing_marks &&
			data.external_marks >= subject.external_passing_marks;

		// Update marks
		const [updatedMarks] = await db
			.update(studentMarksTable)
			.set({
				internal_marks: data.internal_marks,
				external_marks: data.external_marks,
				total_marks,
				is_pass,
				updated_at: new Date(),
			})
			.where(eq(studentMarksTable.id, id))
			.returning();

		logger.info(
			`Updated marks for student ${student.first_name} ${student.last_name} in semester ${semester.title} for subject ${subject.title}`,
			"SYSTEM"
		);

		return {
			data: {
				...updatedMarks,
				student,
				subject,
				semester,
			},
		};
	} catch (error) {
		logger.error(`Error updating student marks: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Get marks for a student in a semester
 */
export async function getStudentSemesterMarks(
	student_id: number,
	semester_id: number
) {
	try {
		// Verify if student exists
		const [student] = await db
			.select({
				id: studentTable.id,
				first_name: userTable.first_name,
				last_name: userTable.last_name,
			})
			.from(studentTable)
			.innerJoin(userTable, eq(studentTable.user_id, userTable.id))
			.where(eq(studentTable.id, student_id));

		if (!student) {
			return { error: "STUDENT_NOT_FOUND" };
		}

		// Verify if semester exists
		const [semester] = await db
			.select()
			.from(semesterTable)
			.where(eq(semesterTable.id, semester_id));

		if (!semester) {
			return { error: "SEMESTER_NOT_FOUND" };
		}

		// Get all marks for student in semester
		const marks = await db
			.select({
				id: studentMarksTable.id,
				internal_marks: studentMarksTable.internal_marks,
				external_marks: studentMarksTable.external_marks,
				total_marks: studentMarksTable.total_marks,
				is_pass: studentMarksTable.is_pass,
				created_at: studentMarksTable.created_at,
				updated_at: studentMarksTable.updated_at,
				subject: {
					id: subjectTable.id,
					title: subjectTable.title,
					code: subjectTable.code,
					internal_marks: subjectTable.internal_marks,
					external_marks: subjectTable.external_marks,
					internal_passing_marks: subjectTable.internal_passing_marks,
					external_passing_marks: subjectTable.external_passing_marks,
				},
			})
			.from(studentMarksTable)
			.innerJoin(
				subjectTable,
				eq(studentMarksTable.subject_id, subjectTable.id)
			)
			.where(
				and(
					eq(studentMarksTable.student_id, student_id),
					eq(studentMarksTable.semester_id, semester_id)
				)
			);

		return {
			data: {
				student,
				semester,
				marks,
			},
		};
	} catch (error) {
		logger.error(`Error getting student semester marks: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Get all semesters for a student with marks status
 */
export async function getStudentSemesters(student_id: number) {
	try {
		// Verify if student exists
		const [student] = await db
			.select({
				id: studentTable.id,
				first_name: userTable.first_name,
				last_name: userTable.last_name,
			})
			.from(studentTable)
			.innerJoin(userTable, eq(studentTable.user_id, userTable.id))
			.where(eq(studentTable.id, student_id));

		if (!student) {
			return { error: "STUDENT_NOT_FOUND" };
		}

		// Get all semesters with marks status
		const semesters = await db
			.select({
				id: semesterTable.id,
				title: semesterTable.title,
				start_date: semesterTable.start_date,
				end_date: semesterTable.end_date,
				marks_count: sql<number>`count(${studentMarksTable.id})`,
			})
			.from(semesterTable)
			.leftJoin(
				studentMarksTable,
				and(
					eq(studentMarksTable.semester_id, semesterTable.id),
					eq(studentMarksTable.student_id, student_id)
				)
			)
			.groupBy(semesterTable.id)
			.orderBy(semesterTable.start_date);

		return {
			data: {
				student,
				semesters,
			},
		};
	} catch (error) {
		logger.error(`Error getting student semesters: ${error}`, "SYSTEM");
		throw error;
	}
}

/**
 * Delete marks for a student in a semester
 */
export async function deleteStudentSemesterMarks(
	student_id: number,
	semester_id: number
) {
	try {
		// Verify if student exists
		const [student] = await db
			.select({
				id: studentTable.id,
				first_name: userTable.first_name,
				last_name: userTable.last_name,
			})
			.from(studentTable)
			.innerJoin(userTable, eq(studentTable.user_id, userTable.id))
			.where(eq(studentTable.id, student_id));

		if (!student) {
			return { error: "STUDENT_NOT_FOUND" };
		}

		// Verify if semester exists
		const [semester] = await db
			.select()
			.from(semesterTable)
			.where(eq(semesterTable.id, semester_id));

		if (!semester) {
			return { error: "SEMESTER_NOT_FOUND" };
		}

		// Delete all marks for student in semester
		await db
			.delete(studentMarksTable)
			.where(
				and(
					eq(studentMarksTable.student_id, student_id),
					eq(studentMarksTable.semester_id, semester_id)
				)
			);

		logger.info(
			`Deleted all marks for student ${student.first_name} ${student.last_name} in semester ${semester.title}`,
			"SYSTEM"
		);

		return { data: true };
	} catch (error) {
		logger.error(`Error deleting student semester marks: ${error}`, "SYSTEM");
		throw error;
	}
}
