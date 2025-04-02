import { eq } from "drizzle-orm";
import db from "../../db";
import {
  facultyTable,
  userTable,
  Role,
  Designation,
} from "../../db/schema/user";
import logger from "../../libs/logger";
import { hashPassword } from "../../services/user.service";
import { branchTable } from "@/db/schema/branch";

/**
 * Create a new faculty member
 */
export async function createFaculty(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone: number;
  designation: Designation;
  branch_id: number;
}) {
  try {
    const [faculty] = await db.transaction(async (tx) => {
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
          role: Role.FACULTY,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      // Create faculty record
      const [faculty] = await tx
        .insert(facultyTable)
        .values({
          user_id: user.id,
          designation: data.designation,
          branch_id: data.branch_id,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return [faculty];
    });

    logger.info(`Faculty created with ID: ${faculty.id}`, "FACULTY");

    return faculty;
  } catch (error) {
    logger.error(`Error creating faculty: ${error}`, "FACULTY");
    throw error;
  }
}

/**
 * Get all faculty members
 */
export async function getAllFaculty() {
  try {
    const faculty = await db
      .select({
        id: facultyTable.id,
        user_id: facultyTable.user_id,
        designation: facultyTable.designation,
        branch: branchTable.title,
        email: userTable.email,
        first_name: userTable.first_name,
        last_name: userTable.last_name,
        middle_name: userTable.middle_name,
        phone: userTable.phone,
      })
      .from(facultyTable)
      .innerJoin(userTable, eq(facultyTable.user_id, userTable.id))
      .leftJoin(branchTable, eq(facultyTable.branch_id, branchTable.id))
      .where(eq(userTable.role, Role.FACULTY));

    return faculty;
  } catch (error) {
    logger.error(`Error fetching faculty: ${error}`, "FACULTY");
    throw error;
  }
}

/**
 * Get faculty by ID
 */
export async function getFacultyById(id: number) {
  try {
    const [faculty] = await db
      .select({
        id: facultyTable.id,
        user_id: facultyTable.user_id,
        designation: facultyTable.designation,
        branch_id: facultyTable.branch_id,
        created_at: facultyTable.created_at,
        updated_at: facultyTable.updated_at,
        email: userTable.email,
        first_name: userTable.first_name,
        last_name: userTable.last_name,
        middle_name: userTable.middle_name,
        phone: userTable.phone,
      })
      .from(facultyTable)
      .innerJoin(userTable, eq(facultyTable.user_id, userTable.id))
      .where(eq(facultyTable.id, id))
      .limit(1);

    return faculty || null;
  } catch (error) {
    logger.error(`Error fetching faculty: ${error}`, "FACULTY");
    throw error;
  }
}

/**
 * Update faculty
 */
export async function updateFaculty(
  id: number,
  data: {
    email?: string;
    first_name?: string;
    middle_name?: string | null;
    last_name?: string | null;
    phone?: number;
    designation?: Designation;
    branch_id?: number;
  },
) {
  try {
    const [faculty] = await db.transaction(async (tx) => {
      // Get faculty with user
      const [facultyRecord] = await tx
        .select()
        .from(facultyTable)
        .where(eq(facultyTable.id, id))
        .limit(1);

      if (!facultyRecord) {
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
          .where(eq(userTable.id, facultyRecord.user_id));
      }

      // Update faculty if needed
      if (data.designation || data.branch_id) {
        const [updatedFaculty] = await tx
          .update(facultyTable)
          .set({
            designation: data.designation,
            branch_id: data.branch_id,
            updated_at: new Date(),
          })
          .where(eq(facultyTable.id, id))
          .returning();

        return [updatedFaculty];
      }

      return [facultyRecord];
    });

    if (!faculty) {
      return null;
    }

    logger.info(`Faculty updated with ID: ${faculty.id}`, "FACULTY");

    return faculty;
  } catch (error) {
    logger.error(`Error updating faculty: ${error}`, "FACULTY");
    throw error;
  }
}

/**
 * Delete faculty
 */
export async function deleteFaculty(id: number) {
  try {
    const [faculty] = await db.transaction(async (tx) => {
      // Get faculty with user
      const [facultyRecord] = await tx
        .select()
        .from(facultyTable)
        .where(eq(facultyTable.id, id))
        .limit(1);

      if (!facultyRecord) {
        return [null];
      }

      // Delete faculty record
      await tx.delete(facultyTable).where(eq(facultyTable.id, id));

      // Delete user record
      await tx.delete(userTable).where(eq(userTable.id, facultyRecord.user_id));

      return [facultyRecord];
    });

    if (!faculty) {
      return false;
    }

    logger.info(`Faculty deleted with ID: ${faculty.id}`, "FACULTY");

    return true;
  } catch (error) {
    logger.error(`Error deleting faculty: ${error}`, "FACULTY");
    throw error;
  }
}

/**
 * Check if faculty exists
 */
export async function checkFacultyExists(email: string) {
  try {
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    return !!user;
  } catch (error) {
    logger.error(`Error checking faculty existence: ${error}`, "FACULTY");
    throw error;
  }
}
