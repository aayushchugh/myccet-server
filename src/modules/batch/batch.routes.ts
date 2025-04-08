import { Router } from "express";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postBatchSchema } from "./batch.schema";
import { PostBatchHandler } from "./batch.controller";

export const batchRouter = Router();

batchRouter
	.route("/")
	.post(validateRequestBody(postBatchSchema), PostBatchHandler);

export default batchRouter;
