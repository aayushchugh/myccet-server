import { Router } from "express";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postBatchSchema } from "./batch.schema";
import {
	getAllBatchHandler,
	getBatchHandler,
	postBatchHandler,
} from "./batch.controller";

export const batchRouter = Router();

batchRouter
	.route("/")
	.post(validateRequestBody(postBatchSchema), postBatchHandler)
	.get(getAllBatchHandler);

batchRouter.route("/:id").get(getBatchHandler);

export default batchRouter;
