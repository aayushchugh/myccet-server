import { Router } from "express";
import { Role } from "@/db/schema/user";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import { postCreateBranchSchema, putUpdateBranchSchema } from "./branch.schema";
import {
  postCreateBranchHandler,
  getAllBranchHandler,
  getSingleBranchHandler,
  putBranchHandler,
  deleteBranchHandler,
} from "./branch.controller";

const branchRouter = Router();

branchRouter
  .route("/")
  .post(
    requireRoleMiddleware(Role.ADMIN),
    validateRequestBody(postCreateBranchSchema),
    postCreateBranchHandler,
  )
  .get(getAllBranchHandler);

branchRouter
  .route("/:id")
  .get(getSingleBranchHandler)
  .put(
    requireRoleMiddleware(Role.ADMIN),
    validateRequestBody(putUpdateBranchSchema),
    putBranchHandler,
  )
  .delete(requireRoleMiddleware(Role.ADMIN), deleteBranchHandler);

export default branchRouter;
