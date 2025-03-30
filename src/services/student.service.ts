import { eq, and, isNull } from "drizzle-orm";
import db from "../db";
import { branchTable } from "../db/schema/branch";
import { semesterTable } from "../db/schema/semester";
import { studentTable, userTable, Role } from "../db/schema/user";
import { createBaseUser, updateBaseUser, softDeleteUser } from "./user.service";
import logger from "../libs/logger";
import { number } from "zod";
interface StudentData {
  email: string;
  password: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  phone: number;
  registration_number: number;
  avatar_url?: string;
  father_name: string;
  mother_name: string;
  category: string;
  course_type: string;
  branch_id: number;
  semester_ids: number[];
}

/**
 * Create a new student
 */
export async function createStudent(studentData: StudentData): Promise<number> {
  const userId = await createBaseUser({
    ...studentData,
    role: Role.STUDENT,
  });

  const [student] = await db
    .insert(studentTable)
    .values({
      user_id: userId,
      registration_number: Number(studentData.registration_number),
      avatar_url: studentData.avatar_url || null,
      father_name: String(studentData.father_name),
      mother_name: String(studentData.mother_name),
      category: String(studentData.category),
      course_type: String(studentData.course_type),
      branch_id: studentData.branch_id,
    })
    .returning({ id: studentTable.id });

  logger.info(
    `Student account created with email: ${studentData.email}`,
    "STUDENT"
  );

  return student.id;
}

/**
 * Get all students with their user details
 */
export async function getAllStudents() {
  const students = await db
    .select({
      id: userTable.id,
      email: userTable.email,
      first_name: userTable.first_name,
      middle_name: userTable.middle_name,
      last_name: userTable.last_name,
      phone: userTable.phone,
      branch: { title: branchTable.title },
      semester: { title: semesterTable.title },
      category: studentTable.category,
      course_type: studentTable.course_type,
    })
    .from(userTable)
    .innerJoin(studentTable, eq(userTable.id, studentTable.user_id))
    .innerJoin(branchTable, eq(studentTable.branch_id, branchTable.id))
    .innerJoin(semesterTable, eq(studentTable.semester_id, semesterTable.id))
    .where(and(eq(userTable.role, Role.STUDENT), isNull(userTable.deleted_at)));

  return students;
}

/**
 * Get student by ID
 */
export async function getStudentById(id) {
  const [student] = await db
    .select({
      id: userTable.id,
      email: userTable.email,
      first_name: userTable.first_name,
      middle_name: userTable.middle_name,
      last_name: userTable.last_name,
      phone: userTable.phone,
      branch_id: branchTable.id,
      semester_id: semesterTable.id,
      category: studentTable.category,
      course_type: studentTable.course_type,
    })
    .from(userTable)
    .innerJoin(studentTable, eq(userTable.id, studentTable.user_id))
    .innerJoin(branchTable, eq(studentTable.branch_id, branchTable.id))
    .innerJoin(semesterTable, eq(studentTable.semester_id, semesterTable.id))
    .where(and(eq(userTable.id, id), isNull(userTable.deleted_at)));

  return student || null;
}

/**
 * Update student details
 */
export async function updateStudent(id, studentData) {
  const { branch_id, semester_id, ...userData } = studentData;

  const updatedUser = await updateBaseUser(id, userData);

  if (!updatedUser) return null;

  await db
    .update(studentTable)
    .set({
      branch_id: branch_id || undefined,
      semester_id: semester_id || undefined,
      updated_at: new Date(),
    })
    .where(eq(studentTable.user_id, id));

  return getStudentById(id);
}

/**
 * Delete student
 */
export async function deleteStudent(id) {
  return softDeleteUser(id);
}
