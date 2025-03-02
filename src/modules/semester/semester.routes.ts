import { Role } from "@/db/schema/user";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import { Router } from "express";
import { postCreateSemesterSchema } from "./semester.schema";
import { postCreateSemesterHandler } from "./semester.controller";

const semesterRouter = Router();

semesterRouter.post(
  "/",
  requireRoleMiddleware(Role.ADMIN),
  validateRequestBody(postCreateSemesterSchema),
  postCreateSemesterHandler,
);

export default semesterRouter;
