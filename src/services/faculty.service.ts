import { eq, and, isNull } from "drizzle-orm";
import db from "../db";
import {
  facultyTable,
  userTable,
  Role,
  Faculty,
  Designation,
} from "../db/schema/user";
import { createBaseUser, updateBaseUser, softDeleteUser } from "./user.service";
import logger from "../libs/logger";

/**
 * Create a new faculty member
 */
export async function createFaculty(facultyData: {
  email: string;
  password: string;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  phone: number;
  designation: Designation;
  branch_id: number;
}): Promise<number> {
  // Create base user with faculty role
  const userId = await createBaseUser({
    ...facultyData,
    role: Role.FACULTY,
  });

  // Create faculty record
  const [faculty] = await db
    .insert(facultyTable)
    .values({
      user_id: userId,
      branch_id: facultyData.branch_id,
      designation: facultyData.designation,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning({ id: facultyTable.id });

  logger.info(
    `Faculty account created with email: ${facultyData.email}`,
    "FACULTY"
  );

  return faculty.id;
}

/**
 * Get all faculty members with their user details
 */
export async function getAllFaculty() {
  const faculty = await db
    .select({
      id: userTable.id,
      email: userTable.email,
      first_name: userTable.first_name,
      middle_name: userTable.middle_name,
      last_name: userTable.last_name,
      phone: userTable.phone,
      designation: facultyTable.designation,
      branch_id: facultyTable.branch_id,
    })
    .from(userTable)
    .innerJoin(facultyTable, eq(userTable.id, facultyTable.user_id))
    .where(and(eq(userTable.role, Role.FACULTY), isNull(userTable.deleted_at)));

  return faculty;
}

/**
 * Get faculty member by ID
 */
export async function getFacultyById(id: number) {
  const [faculty] = await db
    .select({
      id: userTable.id,
      email: userTable.email,
      first_name: userTable.first_name,
      middle_name: userTable.middle_name,
      last_name: userTable.last_name,
      phone: userTable.phone,
      designation: facultyTable.designation,
      branch_id: facultyTable.branch_id,
    })
    .from(userTable)
    .innerJoin(facultyTable, eq(userTable.id, facultyTable.user_id))
    .where(and(eq(userTable.id, id), isNull(userTable.deleted_at)));

  return faculty || null;
}

/**
 * Update faculty member
 */
export async function updateFaculty(
  id: number,
  facultyData: {
    email?: string;
    first_name?: string;
    middle_name?: string | null;
    last_name?: string | null;
    phone?: number;
    designation?: Designation;
    branch_id?: number;
  }
) {
  // Extract designation from facultyData
  const { designation, ...userData } = facultyData;

  // Update base user information
  const updatedUser = await updateBaseUser(id, userData);

  if (!updatedUser) {
    return null;
  }

  // Update faculty-specific information if designation is provided
  if (designation) {
    await db
      .update(facultyTable)
      .set({
        designation,
        updated_at: new Date(),
      })
      .where(eq(facultyTable.user_id, id));
  }

  // Get updated faculty
  return getFacultyById(id);
}

/**
 * Delete faculty member
 */
export async function deleteFaculty(id: number): Promise<boolean> {
  return softDeleteUser(id);
}
