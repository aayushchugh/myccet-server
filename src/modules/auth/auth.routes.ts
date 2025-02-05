import { Router } from "express";
import { postAdminSignupHandler } from "./auth.controller";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postAdminSignupBodySchema } from "./auth.schema";

const authRouter = Router();
authRouter.post(
	"/admin/auth/signup",
	validateRequestBody(postAdminSignupBodySchema),
	postAdminSignupHandler
);

export default authRouter;
