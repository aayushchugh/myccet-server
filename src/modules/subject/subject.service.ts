import { subjectTable } from "../../db/schema/subject";
import { subjectSemesterBranchTable } from "../../db/schema/relation";
import db from "../../db";
import { eq, and } from "drizzle-orm";
import logger from "../../libs/logger";

export async function createSubject(data: {
  title: string;
  code: string;
  internal_passing_marks: number;
  external_passing_marks: number;
  internal_marks: number;
  external_marks: number;
}) {
  try {
    const [subject] = await db
      .insert(subjectTable)
      .values({
        title: data.title,
        code: data.code,
        external_passing_marks: data.external_passing_marks,
        internal_passing_marks: data.internal_passing_marks,
        external_marks: data.external_marks,
        internal_marks: data.internal_marks,
      })
      .returning();

    logger.info(`Subject created with title: ${data.title}`, "SYSTEM");

    return subject;
  } catch (err) {
    logger.error(`Error creating subject: ${err}`, "SYSTEM");
    throw err;
  }
}

export async function assignSubjectToSemesterBranch(data: {
  subject_id: number;
  semester_id: number;
  branch_id: number;
}) {
  try {
    const [mapping] = await db
      .insert(subjectSemesterBranchTable)
      .values({
        subject_id: data.subject_id,
        semester_id: data.semester_id,
        branch_id: data.branch_id,
      })
      .returning();

    logger.info(
      `Subject ${data.subject_id} assigned to semester ${data.semester_id} and branch ${data.branch_id}`,
      "SYSTEM"
    );

    return mapping;
  } catch (err) {
    logger.error(
      `Error assigning subject to semester and branch: ${err}`,
      "SYSTEM"
    );
    throw err;
  }
}

export async function getAllSubjects() {
  try {
    const subjects = await db.select().from(subjectTable);
    return subjects;
  } catch (err) {
    logger.error(`Error fetching subjects: ${err}`, "SYSTEM");
    throw err;
  }
}

export async function getSubjectById(id: number) {
  try {
    const [subject] = await db
      .select()
      .from(subjectTable)
      .where(eq(subjectTable.id, id));

    return subject;
  } catch (err) {
    logger.error(`Error fetching subject: ${err}`, "SYSTEM");
    throw err;
  }
}

export async function getSubjectsBySemesterBranch(
  semester_id: number,
  branch_id: number
) {
  try {
    const subjects = await db
      .select({
        id: subjectTable.id,
        title: subjectTable.title,
        code: subjectTable.code,
        internal_marks: subjectTable.internal_marks,
        external_marks: subjectTable.external_marks,
        internal_passing_marks: subjectTable.internal_passing_marks,
        external_passing_marks: subjectTable.external_passing_marks,
      })
      .from(subjectSemesterBranchTable)
      .innerJoin(
        subjectTable,
        eq(subjectSemesterBranchTable.subject_id, subjectTable.id)
      )
      .where(
        and(
          eq(subjectSemesterBranchTable.semester_id, semester_id),
          eq(subjectSemesterBranchTable.branch_id, branch_id)
        )
      );

    return subjects;
  } catch (err) {
    logger.error(
      `Error fetching subjects by semester and branch: ${err}`,
      "SYSTEM"
    );
    throw err;
  }
}

export async function updateSubject(
  id: number,
  data: {
    title?: string;
    code?: string;
    internal_passing_marks?: number;
    external_passing_marks?: number;
    internal_marks?: number;
    external_marks?: number;
  }
) {
  try {
    const [subject] = await db
      .update(subjectTable)
      .set({
        title: data.title,
        code: data.code,
        external_passing_marks: data.external_passing_marks,
        internal_passing_marks: data.internal_passing_marks,
        external_marks: data.external_marks,
        internal_marks: data.internal_marks,
      })
      .where(eq(subjectTable.id, id))
      .returning();

    logger.info(`Subject updated with ID: ${id}`, "SYSTEM");

    return subject;
  } catch (err) {
    logger.error(`Error updating subject: ${err}`, "SYSTEM");
    throw err;
  }
}

export async function deleteSubjectByCode(code: string) {
  try {
    const [subject] = await db
      .delete(subjectTable)
      .where(eq(subjectTable.code, code))
      .returning();

    logger.info(`Subject deleted with code: ${code}`, "SYSTEM");

    return subject;
  } catch (err) {
    logger.error(`Error deleting subject by code: ${err}`, "SYSTEM");
    throw err;
  }
}

export async function checkSubjectExists(title?: string, code?: string) {
  try {
    if (title) {
      const [subject] = await db
        .select()
        .from(subjectTable)
        .where(eq(subjectTable.title, title));

      if (subject) {
        return true;
      }
    }

    if (code) {
      const [subject] = await db
        .select()
        .from(subjectTable)
        .where(eq(subjectTable.code, code));

      if (subject) {
        return true;
      }
    }

    return false;
  } catch (err) {
    logger.error(`Error checking subject exists: ${err}`, "SYSTEM");
    throw err;
  }
}
