import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import { Router } from "express";
import { postMarksBodySchema } from "./marks.schema";
import { postMarksHandler } from "./marks.controller";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { Role } from "@/db/schema/user";

const marksRouter = Router();

marksRouter
  .route("/")
  .post(
    requireRoleMiddleware(Role.ADMIN),
    validateRequestBody(postMarksBodySchema),
    postMarksHandler,
  );

export default marksRouter;
