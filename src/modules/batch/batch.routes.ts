import { Router } from "express";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postBatchDetailsSchema, postBatchSchema } from "./batch.schema";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { Role } from "@/db/schema/user";
import {
  deleteBatchHandler,
  getAllBatchHandler,
  getBatchHandler,
  postBatchDetailsHandler,
  postBatchHandler,
} from "./batch.controller";

export const batchRouter = Router();

batchRouter
  .route("/")
  .post(validateRequestBody(postBatchSchema), postBatchHandler)
  .get(getAllBatchHandler);

batchRouter.post(
  "/:id/details",
  validateRequestBody(postBatchDetailsSchema),
  postBatchDetailsHandler
);

batchRouter;
batchRouter
  .route("/:id")
  .get(getBatchHandler)
  .delete(requireRoleMiddleware(Role.ADMIN), deleteBatchHandler);

export default batchRouter;
