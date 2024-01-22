import { Router } from "express";
import { postLoginController } from "./auth.controller";
import validateRequestMiddleware from "../../common/middlewares/validateRequest.middleware";
import { postLoginSchema } from "./auth.schema";

const authRouter = Router();

authRouter.post(
	"/auth/login",
	validateRequestMiddleware(postLoginSchema),
	postLoginController
);

export default authRouter;
