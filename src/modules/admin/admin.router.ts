import { Router } from "express";
import { requireRoleMiddleware } from "../../middlewares/require-role.middleware";
import { Role } from "../../db/schema/user";
import {
  deleteAdminHandler,
  getAdminHandler,
  getAllAdminsHandler,
  postAdminHandler,
  putAdminHandler,
} from "./admin.controller";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postAdminBodySchema } from "./admin.schema";

const adminRouter = Router();

adminRouter.post(
  "/",
  requireRoleMiddleware(Role.ADMIN),
  validateRequestBody(postAdminBodySchema),
  postAdminHandler,
);

adminRouter.get("/", getAllAdminsHandler);
adminRouter
  .route("/:id/")
  .get(getAdminHandler)
  .delete(deleteAdminHandler)
  .put(putAdminHandler);

export default adminRouter;
