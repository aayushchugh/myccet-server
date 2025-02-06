import { Router } from "express";
import { postLoginHandler, postSignupHandler } from "./auth.controller";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postLoginBodySchema, postSignupBodySchema } from "./auth.schema";

const authRouter = Router();
authRouter.post(
	"/signup",
	validateRequestBody(postSignupBodySchema),
	postSignupHandler
);
authRouter.post(
	"/login",
	validateRequestBody(postLoginBodySchema),
	postLoginHandler
);

export default authRouter;
