import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { PostCreateSemesterBody } from "./semester.schema";
import db from "@/db";
import { semesterTable } from "@/db/schema/semester";
import { isNull } from "drizzle-orm";

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
