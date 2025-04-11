import { Router } from "express";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postBatchDetailsSchema, postBatchSchema } from "./batch.schema";
import {
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

batchRouter.route("/:id").get(getBatchHandler);

export default batchRouter;
