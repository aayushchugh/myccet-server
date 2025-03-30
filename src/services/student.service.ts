import db from "@/db";
import { userTable, Role, studentTable, Student } from "@/db/schema/user";
import { eq } from "drizzle-orm";
import logger from "@/libs/logger";
import { z } from "zod";
import {
	postCreateStudentSchema,
	putStudentSchema,
} from "@/modules/student/student.schema";
import { hashPassword } from "./user.service";
import { studentSemesterTable } from "../db/schema/relation";
import { branchTable } from "../db/schema/branch";
import { semesterTable } from "../db/schema/semester";

export async function createStudent(
	data: z.infer<typeof postCreateStudentSchema>
) {
	// Create user account
	const [user] = await db
		.insert(userTable)
		.values({
			first_name: data.first_name,
			middle_name: data.middle_name,
			last_name: data.last_name,
			email: data.email,
			password: await hashPassword(data.password),
			phone: data.phone,
			role: Role.STUDENT,
		})
		.returning();

	// Create student record
	const [student] = await db
		.insert(studentTable)
		.values({
			user_id: user.id,
			branch_id: data.branch_id,
			registration_number: data.registration_number,
			current_semester_id: data.current_semester_id,
			father_name: data.father_name,
			mother_name: data.mother_name,
			category: data.category,
		})
		.returning();

	// link student and semester
	await db.insert(studentSemesterTable).values({
		student_id: student.id,
		semester_id: data.current_semester_id,
	});

	logger.info(`Student created with ID: ${student.id}`, "STUDENT");

	return student;
}

export async function getStudentById(id: number) {
	return await db
		.select()
		.from(studentTable)
		.where(eq(studentTable.id, id))
		.limit(1)
		.then((rows: Student[]) => rows[0]);
}

export async function getAllStudents() {
	return await db
		.select({
			id: studentTable.id,
			registration_number: studentTable.registration_number,
			first_name: userTable.first_name,
			middle_name: userTable.middle_name,
			last_name: userTable.last_name,
			email: userTable.email,
			phone: userTable.phone,
			branch: branchTable.title,
			current_semester: semesterTable.title,
		})
		.from(studentTable)
		.innerJoin(userTable, eq(studentTable.user_id, userTable.id))
		.innerJoin(branchTable, eq(studentTable.branch_id, branchTable.id))
		.innerJoin(
			semesterTable,
			eq(studentTable.current_semester_id, semesterTable.id)
		);
}

export async function updateStudent(
	id: number,
	data: z.infer<typeof putStudentSchema>
) {
	const [student] = await db
		.select()
		.from(studentTable)
		.where(eq(studentTable.id, id));

	if (!student) {
		return null;
	}

	// Update user details
	await db
		.update(userTable)
		.set({
			first_name: data.first_name,
			middle_name: data.middle_name,
			last_name: data.last_name,
			email: data.email,
			phone: data.phone,
		})
		.where(eq(userTable.id, student.user_id));

	// Update student details
	const [updatedStudent] = await db
		.update(studentTable)
		.set({
			branch_id: data.branch_id,
			current_semester_id: data.current_semester_id,
			registration_number: data.registration_number,
			father_name: data.father_name,
			mother_name: data.mother_name,
			category: data.category,
		})
		.where(eq(studentTable.id, id))
		.returning();

	return updatedStudent;
}

export async function deleteStudent(id: number) {
	const [student] = await db
		.select()
		.from(studentTable)
		.where(eq(studentTable.id, id));

	if (!student) {
		return false;
	}

	// Delete student record
	await db.delete(studentTable).where(eq(studentTable.id, id));

	// Delete user account
	await db.delete(userTable).where(eq(userTable.id, student.user_id));

	return true;
}
