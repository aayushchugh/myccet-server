import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import {
  PostCreateSemesterBody,
  PutUpdateSemesterBody,
} from "./semester.schema";
import db from "@/db";
import { semesterTable } from "@/db/schema/semester";
import { and, eq, isNull } from "drizzle-orm";
import {
  semesterBranchTable,
  semesterSubjectTable,
  studentSemesterTable,
} from "@/db/schema/relation";
import { studentTable } from "@/db/schema/user";
import { branchTable } from "@/db/schema/branch";
import { subjectTable } from "@/db/schema/subject";

export async function postCreateSemesterHandler(
  req: Request<{}, {}, PostCreateSemesterBody>,
  res: Response,
) {
  try {
    const { title, start_date, end_date, branch_id, subject_ids } = req.body;

    // Step 1: Create new semester
    const [newSemester] = await db
      .insert(semesterTable)
      .values({
        title,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      })
      .returning({ id: semesterTable.id }); // Get inserted semester ID

    if (!newSemester) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to create semester",
      });
      return;
    }

    const semesterId = newSemester.id;

    // Step 2: Map semester to branch
    await db.insert(semesterBranchTable).values({
      semester_id: semesterId,
      branch_id,
    });

    // Step 3: Assign subjects to semester
    if (subject_ids && subject_ids.length > 0) {
      const subjectMappings = subject_ids.map((subject_id) => ({
        semester_id: semesterId,
        subject_id,
      }));

      await db.insert(semesterSubjectTable).values(subjectMappings);
    }

    // Step 4: Enroll students from the branch in this semester
    const students = await db
      .select({ id: studentTable.id })
      .from(studentTable)
      .where(eq(studentTable.branch_id, branch_id));

    if (students.length > 0) {
      const studentSemesterMappings = students.map((student) => ({
        student_id: student.id,
        semester_id: semesterId,
      }));

      await db.insert(studentSemesterTable).values(studentSemesterMappings);
    }

    res.status(StatusCodes.CREATED).json({
      message: "Semester created successfully",
    });

    return;
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });

    return;
  }
}

export async function getAllSemesterHandler(req: Request, res: Response) {
  try {
    const semesters = await db
      .select({
        id: semesterTable.id,
        title: semesterTable.title,
        start_date: semesterTable.start_date,
        end_date: semesterTable.end_date,
      })
      .from(semesterTable)
      .where(isNull(semesterTable.deleted_at));

    res.status(StatusCodes.OK).json({
      message: "semesters fetched successfully",
      payload: semesters,
    });

    return;
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });

    return;
  }
}

export async function getSingleSemesterHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    // Fetch semester details with branch
    const [semester] = await db
      .select({
        id: semesterTable.id,
        title: semesterTable.title,
        branch: { title: branchTable.title },
        start_date: semesterTable.start_date,
        end_date: semesterTable.end_date,
      })
      .from(semesterTable)
      .where(and(eq(semesterTable.id, +id), isNull(semesterTable.deleted_at)))
      .leftJoin(
        semesterBranchTable,
        eq(semesterTable.id, semesterBranchTable.semester_id),
      )
      .innerJoin(
        branchTable,
        eq(semesterBranchTable.branch_id, branchTable.id),
      );

    if (!semester) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Semester not found",
      });

      return;
    }

    // Fetch subjects related to this semester
    const subjects = await db
      .select({ id: subjectTable.id, title: subjectTable.title })
      .from(subjectTable)
      .innerJoin(
        semesterSubjectTable,
        eq(subjectTable.id, semesterSubjectTable.subject_id),
      )
      .where(eq(semesterSubjectTable.semester_id, +id));

    res.status(StatusCodes.OK).json({
      message: "Semester fetched successfully",
      payload: {
        ...semester,
        subjects,
      },
    });

    return;
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });

    return;
  }
}

export async function putSemesterHandler(
  req: Request<{}, {}, PutUpdateSemesterBody>,
  res: Response,
) {
  try {
    const { title, start_date, end_date } = req.body;

    await db.update(semesterTable).set({
      title,
      ...(start_date ? { start_date: new Date(start_date) } : {}),
      ...(end_date ? { end_date: new Date(end_date) } : {}),
    });

    res.status(StatusCodes.OK).json({
      message: "Semester updated successfully",
    });

    return;
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });

    return;
  }
}

export async function deleteSemesterHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    await db
      .update(semesterTable)
      .set({ deleted_at: new Date() })
      .where(eq(semesterTable.id, +id));

    res.status(StatusCodes.OK).json({
      message: "Semester deleted successfully",
    });

    return;
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });

    return;
  }
}
