import { Router } from "express";
import { requireRoleMiddleware } from "../../middlewares/require-role.middleware";
import { Role } from "../../db/schema/user";
import {
  deleteFacultyHandler,
  getFacultyHandler,
  getAllFacultyHandler,
  postFacultyHandler,
  putFacultyHandler,
} from "./faculty.controller";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postFacultyBodySchema } from "./faculty.schema";

const facultyRouter = Router();

facultyRouter.post(
  "/",
  requireRoleMiddleware(Role.ADMIN),
  validateRequestBody(postFacultyBodySchema),
  postFacultyHandler
);

facultyRouter.get("/", getAllFacultyHandler);
facultyRouter
  .route("/:id/")
  .get(getFacultyHandler)
  .delete(requireRoleMiddleware(Role.ADMIN), deleteFacultyHandler)
  .put(requireRoleMiddleware(Role.ADMIN), putFacultyHandler);

export default facultyRouter;
