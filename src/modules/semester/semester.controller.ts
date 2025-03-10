import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { PostCreateSemesterBody } from "./semester.schema";
import db from "@/db";
import { semesterTable } from "@/db/schema/semester";
import { and, eq, isNull } from "drizzle-orm";

export async function postCreateSemesterHandler(
  req: Request<{}, {}, PostCreateSemesterBody>,
  res: Response,
) {
  try {
    const { title, start_date, end_date } = req.body;

    // Create new semester
    await db.insert(semesterTable).values({
      title,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
    });

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

    const [semster] = await db
      .select({
        id: semesterTable.id,
        title: semesterTable.title,
        start_date: semesterTable.start_date,
        end_date: semesterTable.end_date,
      })
      .from(semesterTable)
      .where(and(eq(semesterTable.id, +id), isNull(semesterTable.deleted_at)));

    if (!semster) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Semester not found",
      });

      return;
    }

    res.status(StatusCodes.OK).json({
      message: "Semester fetched successfully",
      payload: semster,
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
