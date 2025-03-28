import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostStudentBody, PutStudentBody } from "./student.schema";
import logger from "../../libs/logger";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../../services/student.service";

export async function postStudentHandler(
  req: Request<{}, {}, PostStudentBody>,
  res: Response
): Promise<void> {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      registration_number,
      email,
      phone,
      fathers_name,
      mothers_name,
      category,
      semester_id,
      branch_id,
      course_type,
    } = req.body;

    await createStudent({
      first_name,
      middle_name,
      last_name,
      registration_number,
      email,
      phone,
      fathers_name,
      mothers_name,
      category,
      semester_id,
      branch_id,
      course_type,
    });

    logger.info(`Student account created with email: ${email}`, "STUDENT");

    res.status(StatusCodes.CREATED).json({
      message: "Student account created successfully",
    });
  } catch (err: any) {
    console.error(err);

    if (err.code === "23505") {
      if (err.constraint === "student_email_unique") {
        res.status(StatusCodes.CONFLICT).json({
          errors: { email: "Account with same email already exists" },
        });
        return;
      }
      if (err.constraint === "student_phone_unique") {
        res.status(StatusCodes.CONFLICT).json({
          errors: { phone: "Account with same phone already exists" },
        });
        return;
      }
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

export async function getAllStudentsHandler(req: Request, res: Response) {
  try {
    const students = await getAllStudents();

    res.status(StatusCodes.OK).json({
      message: "Students fetched successfully",
      payload: students,
    });
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

export async function getStudentHandler(
  req: Request<{ id: string }>,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const student = await getStudentById(parseInt(id));

    if (!student) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Student not found",
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      message: "Student fetched successfully",
      payload: student,
    });
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

export async function deleteStudentHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const success = await deleteStudent(parseInt(id));

    if (!success) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Student not found",
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      message: "Student deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

export async function putStudentHandler(
  req: Request<{ id: string }, {}, PutStudentBody>,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      first_name,
      middle_name,
      last_name,
      registration_number,
      email,
      phone,
      fathers_name,
      mothers_name,
      category,
      semester_id,
      branch_id,
      course_type,
    } = req.body;

    const updatedStudent = await updateStudent(parseInt(id), {
      first_name,
      middle_name,
      last_name,
      registration_number,
      email,
      phone,
      fathers_name,
      mothers_name,
      category,
      semester_id,
      branch_id,
      course_type,
    });

    if (!updatedStudent) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Student not found",
      });

      return;
    }

    res.status(StatusCodes.OK).json({
      message: "Student updated successfully",
    });
    return;
  } catch (err: any) {
    console.error(err);

    if (err.code === "23505") {
      if (err.constraint === "student_email_unique") {
        res.status(StatusCodes.CONFLICT).json({
          errors: { email: "Account with same email already exists" },
        });
        return;
      }
      if (err.constraint === "student_phone_unique") {
        res.status(StatusCodes.CONFLICT).json({
          errors: { phone: "Account with same phone already exists" },
        });
        return;
      }
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}
