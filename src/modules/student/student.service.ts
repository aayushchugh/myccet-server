import db from "@/db";
import { userTable, Role, studentTable } from "@/db/schema/user";
import { eq, and } from "drizzle-orm";
import logger from "@/libs/logger";

import { hashPassword } from "../../services/user.service";
import { semesterTable } from "../../db/schema/semester";
import { batchTable } from "../../db/schema/batch";
import { subjectTable } from "../../db/schema/subject";
import { studentMarksTable } from "../../db/schema/relation";
import { sql } from "drizzle-orm";

/**
 * Create a new student
 */
export async function createStudent(data: {
	email: string;
	password: string;
	first_name: string;
	last_name?: string;
	middle_name?: string;
	phone: number;
	batch_id: number;
	registration_number: number;
	father_name: string;
	mother_name: string;
	category: string;
	current_semester_id: number;
}) {
	try {
		// Check if semester exists
		const [semester] = await db
			.select()
			.from(semesterTable)
			.where(eq(semesterTable.id, data.current_semester_id));

		if (!semester) {
			throw new Error("Semester not found");
		}

		const [student] = await db.transaction(async tx => {
			// Create user first
			const [user] = await tx
				.insert(userTable)
				.values({
					email: data.email,
					password: await hashPassword(data.password),
					first_name: data.first_name,
					last_name: data.last_name,
					middle_name: data.middle_name,
					phone: data.phone,
					role: Role.STUDENT,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning();

			// Create student record
			const [student] = await tx
				.insert(studentTable)
				.values({
					user_id: user.id,
					batch_id: data.batch_id,
					registration_number: data.registration_number,
					father_name: data.father_name,
					mother_name: data.mother_name,
					category: data.category,
					current_semester_id: data.current_semester_id,
					created_at: new Date(),
					updated_at: new Date(),
				})
				.returning();

			return [student];
		});

		logger.info(`Student created with ID: ${student.id}`, "STUDENT");

		return student;
	} catch (error) {
		logger.error(`Error creating student: ${error}`, "STUDENT");
		throw error;
	}
}

/**
 * Get all students
 */
export async function getAllStudents() {
	try {
		const students = await db
			.select({
				id: studentTable.id,
				batch: {
					id: batchTable.id,
					start_year: batchTable.start_year,
					end_year: batchTable.end_year,
					type: batchTable.type,
				},
				registration_number: studentTable.registration_number,
				father_name: studentTable.father_name,
				mother_name: studentTable.mother_name,
				category: studentTable.category,
				semester: {
					title: semesterTable.title,
					id: semesterTable.id,
				},
				created_at: studentTable.created_at,
				updated_at: studentTable.updated_at,
				email: userTable.email,
				first_name: userTable.first_name,
				last_name: userTable.last_name,
				middle_name: userTable.middle_name,
				phone: userTable.phone,
			})
			.from(studentTable)
			.innerJoin(userTable, eq(studentTable.user_id, userTable.id))
			.innerJoin(
				semesterTable,
				eq(studentTable.current_semester_id, semesterTable.id)
			)
			.innerJoin(batchTable, eq(studentTable.batch_id, batchTable.id))
			.where(eq(userTable.role, Role.STUDENT));

		return students;
	} catch (error) {
		logger.error(`Error fetching students: ${error}`, "STUDENT");
		throw error;
	}
}

/**
 * Get student by ID
 */
export async function getStudentById(id: number) {
	try {
		const [student] = await db
			.select({
				id: studentTable.id,
				registration_number: studentTable.registration_number,
				father_name: studentTable.father_name,
				mother_name: studentTable.mother_name,
				category: studentTable.category,
				email: userTable.email,
				first_name: userTable.first_name,
				last_name: userTable.last_name,
				middle_name: userTable.middle_name,
				phone: userTable.phone,
				batch: {
					id: batchTable.id,
					start_year: batchTable.start_year,
					end_year: batchTable.end_year,
					type: batchTable.type,
				},
				semester: {
					title: semesterTable.title,
					id: semesterTable.id,
				},
			})
			.from(studentTable)
			.innerJoin(userTable, eq(studentTable.user_id, userTable.id))
			.innerJoin(batchTable, eq(studentTable.batch_id, batchTable.id))
			.innerJoin(
				semesterTable,
				eq(studentTable.current_semester_id, semesterTable.id)
			)
			.where(eq(studentTable.id, id))
			.limit(1);

		return student || null;
	} catch (error) {
		logger.error(`Error fetching student: ${error}`, "STUDENT");
		throw error;
	}
}

/**
 * Update student
 */
export async function updateStudent(
	id: number,
	data: {
		email?: string;
		first_name?: string;
		middle_name?: string | null;
		last_name?: string | null;
		phone?: number;
		batch_id?: number;
		registration_number?: number;
		father_name?: string;
		mother_name?: string;
		category?: string;
		current_semester_id?: number;
	}
) {
	try {
		// If current_semester_id is provided, check if it exists
		if (data.current_semester_id) {
			const [semester] = await db
				.select()
				.from(semesterTable)
				.where(eq(semesterTable.id, data.current_semester_id));

			if (!semester) {
				throw new Error("Semester not found");
			}
		}

		const [student] = await db.transaction(async tx => {
			// Get student with user
			const [studentRecord] = await tx
				.select()
				.from(studentTable)
				.where(eq(studentTable.id, id))
				.limit(1);

			if (!studentRecord) {
				return [null];
			}

			// Update user if needed
			if (
				data.email ||
				data.first_name ||
				data.middle_name ||
				data.last_name ||
				data.phone
			) {
				await tx
					.update(userTable)
					.set({
						email: data.email,
						first_name: data.first_name,
						middle_name: data.middle_name,
						last_name: data.last_name,
						phone: data.phone,
						updated_at: new Date(),
					})
					.where(eq(userTable.id, studentRecord.user_id));
			}

			// Update student if needed
			if (
				data.batch_id ||
				data.registration_number ||
				data.father_name ||
				data.mother_name ||
				data.category ||
				data.current_semester_id
			) {
				const [updatedStudent] = await tx
					.update(studentTable)
					.set({
						batch_id: data.batch_id,
						registration_number: data.registration_number,
						father_name: data.father_name,
						mother_name: data.mother_name,
						category: data.category,
						current_semester_id: data.current_semester_id,
						updated_at: new Date(),
					})
					.where(eq(studentTable.id, id))
					.returning();

				return [updatedStudent];
			}

			return [studentRecord];
		});

		if (!student) {
			return null;
		}

		logger.info(`Student updated with ID: ${student.id}`, "STUDENT");

		return student;
	} catch (error) {
		logger.error(`Error updating student: ${error}`, "STUDENT");
		throw error;
	}
}

/**
 * Delete student
 */
export async function deleteStudent(id: number) {
	try {
		const [student] = await db.transaction(async tx => {
			// Get student with user
			const [studentRecord] = await tx
				.select()
				.from(studentTable)
				.where(eq(studentTable.id, id))
				.limit(1);

			if (!studentRecord) {
				return [null];
			}

			// Delete student record
			await tx.delete(studentTable).where(eq(studentTable.id, id));

			// Delete user record
			await tx.delete(userTable).where(eq(userTable.id, studentRecord.user_id));

			return [studentRecord];
		});

		if (!student) {
			return false;
		}

		logger.info(`Student deleted with ID: ${student.id}`, "STUDENT");

		return true;
	} catch (error) {
		logger.error(`Error deleting student: ${error}`, "STUDENT");
		throw error;
	}
}

/**
 * Check if student exists
 */
export async function checkStudentExists(email: string) {
	try {
		const [user] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.limit(1);

		return !!user;
	} catch (error) {
		logger.error(`Error checking student existence: ${error}`, "STUDENT");
		throw error;
	}
}

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

export async function createStudentMarksBulk(data: {
	student_id: number;
	semester_id: number;
	marks: {
		subject_id: number;
		internal_marks: number;
		external_marks: number;
	}[];
}) {
	try {
		// Validate all marks in a single transaction
		const results = await Promise.all(
			data.marks.map(mark =>
				validateAndGetEntities({
					...mark,
					student_id: data.student_id,
					semester_id: data.semester_id,
				})
			)
		);

		// Check for any validation errors
		const errors = results.filter(result => "error" in result);
		if (errors.length > 0) {
			return { error: errors[0].error };
		}

		// Create all marks in a single transaction
		await db.transaction(async tx => {
			for (const mark of data.marks) {
				await tx.insert(studentMarksTable).values({
					student_id: data.student_id,
					semester_id: data.semester_id,
					subject_id: mark.subject_id,
					internal_marks: mark.internal_marks,
					external_marks: mark.external_marks,
					total_marks: mark.internal_marks + mark.external_marks,
					is_pass: mark.internal_marks + mark.external_marks >= 40,
					created_at: new Date(),
					updated_at: new Date(),
				});
			}
		});

		return { success: true };
	} catch (error) {
		logger.error(`Error creating student marks: ${error}`, "STUDENT");
		throw error;
	}
}
