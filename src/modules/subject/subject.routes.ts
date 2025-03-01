import { Role } from "@/db/schema/user";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { Router } from "express";
import {
  deleteSubjectHandler,
  getAllSubjectsHandler,
  getSubjectHandler,
  postCreateSubjectHandler,
} from "./subject.controller";
import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import { postCreateSubjectSchema } from "./subject.schema";

const subjectRouter = Router();

subjectRouter.post(
  "/",
  requireRoleMiddleware(Role.ADMIN),
  validateRequestBody(postCreateSubjectSchema),
  postCreateSubjectHandler,
);

subjectRouter.get("/", getAllSubjectsHandler);
subjectRouter.get("/:code", getSubjectHandler);
subjectRouter.delete("/:code", deleteSubjectHandler);

export default subjectRouter;
