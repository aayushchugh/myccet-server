import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { PostLoginBody, PostSignupBody } from "./auth.schema";
import {
  User,
  userTable,
  Role,
  adminTable,
  facultyTable,
} from "../../db/schema/user";
import db from "../../db";
import { eq } from "drizzle-orm";
import logger from "../../libs/logger";
import { authenticateUser } from "./auth.service";
import { createAdmin } from "../../services/admin.service";

export async function postSignupHandler(
  req: Request<{}, {}, PostSignupBody>,
  res: Response,
) {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      middle_name,
      phone,
      role,
      designation,
    } = req.body;

    // Check if admin already exists
    const admins = await db
      .select()
      .from(userTable)
      .where(eq(userTable.role, Role.ADMIN));

    if (admins.length) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "admin account already exists",
      });

      return;
    }

    // Create new admin account
    await createAdmin({
      email: String(email),
      password: String(password),
      first_name: String(first_name),
      last_name: String(last_name),
      middle_name: middle_name ? String(middle_name) : undefined,
      phone: Number(phone),
      designation,
    });

    logger.info(`Admin account created with email: ${email}`, "AUTH");

    res.status(StatusCodes.CREATED).json({
      message: "account created successfully",
    });

    return;
  } catch (err: any) {
    console.error(err);

    if (err.code === "23505") {
      if (err.constraint === "user_email_unique") {
        res.status(StatusCodes.CONFLICT).json({
          errors: {
            email: "account with same email already exists",
          },
        });

        return;
      }

      if (err.constraint === "user_phone_unique") {
        res.status(StatusCodes.CONFLICT).json({
          errors: {
            phone: "account with same phone already exists",
          },
        });

        return;
      }
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });

    return;
  }
}

export async function postLoginHandler(
  req: Request<{}, {}, PostLoginBody>,
  res: Response,
) {
  try {
    const { email, password } = req.body;

    const authResult = await authenticateUser(email, password);

    if (!authResult.success) {
      if (authResult.error === "user_not_found") {
        res.status(StatusCodes.NOT_FOUND).json({
          message: "user not found",
          errors: [{ email: "user not found" }],
        });
      } else if (authResult.error === "invalid_password") {
        res.status(StatusCodes.UNAUTHORIZED).json({
          message: "invalid password",
          errors: [{ password: "invalid password" }],
        });
      }
      return;
    }

    logger.info(`User logged in with email: ${email}`, "AUTH");

    // set session in cookie
    res.status(StatusCodes.OK).json({
      message: "login successful",
      payload: {
        access_token: authResult.sessionToken,
      },
    });

    return;
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });

    return;
  }
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  try {
    const { id, email, first_name, last_name, middle_name, phone, role } =
      req.user as User;

    // get designation for admin and faculty
    const table = role === Role.ADMIN ? adminTable : facultyTable;

    const [adminFaculty] = await db
      .select({ designation: table.designation })
      .from(table)
      .where(eq(table.user_id, id));

    res.status(StatusCodes.OK).json({
      message: "user found",
      payload: {
        id,
        email,
        first_name,
        last_name,
        middle_name,
        phone,
        role,
        designation: adminFaculty?.designation || null,
      },
    });

    return;
  } catch (err) {
    console.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });

    return;
  }
}
