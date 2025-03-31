import { Router } from "express";
import { Role } from "@/db/schema/user";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import { postCreateBranchSchema, putUpdateBranchSchema } from "./branch.schema";
import {
	getAllBranchesHandler,
	getBranchHandler,
	postBranchHandler,
	deleteBranchHandler,
	putBranchHandler,
} from "./branch.controller";

const branchRouter = Router();

branchRouter
	.route("/")
	.post(
		requireRoleMiddleware(Role.ADMIN),
		validateRequestBody(postCreateBranchSchema),
		postBranchHandler
	)
	.get(getAllBranchesHandler);

branchRouter
	.route("/:id")
	.get(getBranchHandler)
	.put(
		requireRoleMiddleware(Role.ADMIN),
		validateRequestBody(putUpdateBranchSchema),
		putBranchHandler
	)
	.delete(requireRoleMiddleware(Role.ADMIN), deleteBranchHandler);

export default branchRouter;
