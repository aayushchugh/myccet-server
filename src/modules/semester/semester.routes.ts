import { Role } from "@/db/schema/user";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import { Router } from "express";
import { postCreateSemesterSchema } from "./semester.schema";
import {
  deleteSemesterHandler,
  getAllSemesterHandler,
  getSingleSemesterHandler,
  postCreateSemesterHandler,
} from "./semester.controller";

const semesterRouter = Router();

semesterRouter
  .route("/")
  .post(
    requireRoleMiddleware(Role.ADMIN),
    validateRequestBody(postCreateSemesterSchema),
    postCreateSemesterHandler,
  )
  .get(getAllSemesterHandler);

semesterRouter
  .route("/:id")
  .get(getSingleSemesterHandler)
  .delete(requireRoleMiddleware(Role.ADMIN), deleteSemesterHandler);

export default semesterRouter;
