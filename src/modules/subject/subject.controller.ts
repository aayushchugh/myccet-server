import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostCreateSubjectBody, PutUpdateSubjectBody } from "./subject.schema";
import db from "@/db";
import { subjectTable } from "@/db/schema/subject";
import { eq } from "drizzle-orm";

export async function postCreateSubjectHandler(
  req: Request<{}, {}, PostCreateSubjectBody>,
  res: Response,
) {
  try {
    const { code, title } = req.body;

    // Get existing subject
    const [existingSubject] = await db
      .select()
      .from(subjectTable)
      .where(eq(subjectTable.code, code));

    // Check if existing subject has deleted_at
    if (existingSubject.deleted_at) {
      // Update existing subject to be active
      await db
        .update(subjectTable)
        .set({
          title,
          deleted_at: null,
        })
        .where(eq(subjectTable.code, code));

      res.json({
        message: "Subject created successfully",
      });

      return;
    }

    // Create new subject in database
    await db.insert(subjectTable).values({
      code,
      title,
    });

    res.status(StatusCodes.CREATED).json({
      message: "Subject created successfully",
    });

    return;
  } catch (err: any) {
    console.error(err);

    if (err.code === "23505") {
      res.status(StatusCodes.CONFLICT).json({
        errors: {
          code: {
            message: "Subject with same code already exists",
          },
        },
      });

      return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });

    return;
  }
}

export async function getAllSubjectsHandler(req: Request, res: Response) {
  try {
    const subjects = await db
      .select({ code: subjectTable.code, title: subjectTable.title })
      .from(subjectTable);

    res.json({
      message: "Subjects fetched successfully",
      payload: subjects,
    });
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

export async function getSubjectHandler(
  req: Request<{ code: string }>,
  res: Response,
) {
  try {
    const { code } = req.params;

    const subject = await db
      .select({ code: subjectTable.code, title: subjectTable.title })
      .from(subjectTable)
      .where(eq(subjectTable.code, code));

    if (!subject.length) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Subject not found",
      });

      return;
    }

    res.json({
      message: "Subject fetched successfully",
      payload: subject[0],
    });
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

export async function putSubjectHandler(
  req: Request<{ code: string }, {}, PutUpdateSubjectBody>,
  res: Response,
) {
  try {
    const { code } = req.params;
    const { code: newCode, title } = req.body;

    await db
      .update(subjectTable)
      .set({
        code: newCode,
        title,
      })
      .where(eq(subjectTable.code, code));

    res.status(StatusCodes.OK).json({
      message: "Subject updated successfully",
    });

    return;
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

export async function deleteSubjectHandler(
  req: Request<{ code: string }>,
  res: Response,
) {
  try {
    const { code } = req.params;

    await db
      .update(subjectTable)
      .set({
        deleted_at: new Date(),
      })
      .where(eq(subjectTable.code, code));

    res.json({
      message: "Subject deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}
