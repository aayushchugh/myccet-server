import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { PostCreateSemesterBody } from "./semester.schema";
import db from "@/db";
import { semesterTable } from "@/db/schema/semester";

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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });

    return;
  }
}
