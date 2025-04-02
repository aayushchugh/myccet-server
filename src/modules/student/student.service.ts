import db from "@/db";
import { userTable, Role, studentTable, Student } from "@/db/schema/user";
import { eq } from "drizzle-orm";
import logger from "@/libs/logger";
import { z } from "zod";
import {
  postCreateStudentSchema,
  putStudentSchema,
} from "@/modules/student/student.schema";
import { hashPassword } from "../../services/user.service";
import { studentSemesterTable } from "../../db/schema/relation";
import { branchTable } from "../../db/schema/branch";
import { semesterTable } from "../../db/schema/semester";

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
  branch_id: number;
  registration_number: number;
  father_name: string;
  mother_name: string;
  category: string;
  current_semester_id: number;
}) {
  try {
    const [student] = await db.transaction(async (tx) => {
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
          branch_id: data.branch_id,
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
        user_id: studentTable.user_id,
        branch: branchTable.title,
        registration_number: studentTable.registration_number,
        father_name: studentTable.father_name,
        mother_name: studentTable.mother_name,
        category: studentTable.category,
        current_semester_id: studentTable.current_semester_id,
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
      .innerJoin(branchTable, eq(studentTable.branch_id, branchTable.id))
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
        branch: {
          title: branchTable.title,
        },
        semester: {
          title: semesterTable.title,
        },
      })
      .from(studentTable)
      .innerJoin(userTable, eq(studentTable.user_id, userTable.id))
      .innerJoin(branchTable, eq(studentTable.branch_id, branchTable.id))
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
    branch_id?: number;
    registration_number?: number;
    father_name?: string;
    mother_name?: string;
    category?: string;
    current_semester_id?: number;
  }
) {
  try {
    const [student] = await db.transaction(async (tx) => {
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
        data.branch_id ||
        data.registration_number ||
        data.father_name ||
        data.mother_name ||
        data.category ||
        data.current_semester_id
      ) {
        const [updatedStudent] = await tx
          .update(studentTable)
          .set({
            branch_id: data.branch_id,
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
    const [student] = await db.transaction(async (tx) => {
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
