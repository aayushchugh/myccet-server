import { Router } from "express";
import { requireRoleMiddleware } from "../../middlewares/require-role.middleware";
import { Role } from "../../db/schema/user";
import {
  deleteStudentHandler,
  getStudentHandler,
  getAllStudentsHandler,
  postStudentHandler,
  putStudentHandler,
} from "./student.controller";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postStudentBodySchema } from "./student.schema";

const studentRouter = Router();

studentRouter.post(
  "/",
  requireRoleMiddleware(Role.ADMIN),
  validateRequestBody(postStudentBodySchema),
  postStudentHandler
);

studentRouter.get("/", getAllStudentsHandler);

studentRouter
  .route("/:id/")
  .get(getStudentHandler)
  .delete(requireRoleMiddleware(Role.ADMIN), deleteStudentHandler)
  .put(requireRoleMiddleware(Role.ADMIN), putStudentHandler);

export default studentRouter;
