import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "./student.service";
import { postCreateStudentSchema, PutStudentBody } from "./student.schema";
import { z } from "zod";

export async function postCreateStudentHandler(
  req: Request<{}, {}, z.infer<typeof postCreateStudentSchema>>,
  res: Response,
) {
  try {
    await createStudent(req.body);

    res.status(StatusCodes.CREATED).json({
      message: "Student created successfully",
    });
  } catch (err: any) {
    console.error(err);

    // Handle database constraint violations
    if (err.code === "23505") {
      if (err.constraint === "user_email_unique") {
        res.status(StatusCodes.CONFLICT).json({
          errors: {
            email: "Account with same email already exists",
          },
        });
      } else if (err.constraint === "user_phone_unique") {
        res.status(StatusCodes.CONFLICT).json({
          errors: {
            phone: "Account with same phone already exists",
          },
        });
      } else if (
        err.constraint === "student_registration_number_unique" ||
        err.detail?.includes("registration_number")
      ) {
        res.status(StatusCodes.CONFLICT).json({
          errors: {
            registration_number:
              "Student with same registration number already exists",
          },
        });
      }
      return;
    }

    // Handle custom errors from the service layer
    if (err.message === "Registration number already exists") {
      res.status(StatusCodes.CONFLICT).json({
        errors: {
          registration_number:
            "Student with same registration number already exists",
        },
      });
      return;
    }

    if (err.message === "Email already exists") {
      res.status(StatusCodes.CONFLICT).json({
        errors: {
          email: "Account with same email already exists",
        },
      });
      return;
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
  res: Response,
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

export async function putStudentHandler(
  req: Request<{ id: string }, {}, PutStudentBody>,
  res: Response,
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
      father_name,
      mother_name,
      category,
      branch_id,
      current_semester_id,
    } = req.body;

    const updatedStudent = await updateStudent(parseInt(id), {
      first_name,
      middle_name,
      last_name,
      registration_number,
      email,
      phone,
      father_name,
      mother_name,
      category,
      current_semester_id,
      branch_id,
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
      if (
        err.constraint === "student_email_unique" ||
        err.constraint === "user_email_unique"
      ) {
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

      if (err.constraint === "student_registration_number_unique") {
        res.status(StatusCodes.CONFLICT).json({
          errors: {
            registration_number:
              "Student with same registration number already exists",
          },
        });
      }
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

export async function deleteStudentHandler(
  req: Request<{ id: string }>,
  res: Response,
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
