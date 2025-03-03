import { Router } from "express";
import {
  getCurrentUserHandler,
  postLoginHandler,
  postSignupHandler,
} from "./auth.controller";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postLoginBodySchema, postSignupBodySchema } from "./auth.schema";
import { requireLoginMiddleware } from "@/middlewares/require-login.middleware";

const authRouter = Router();
authRouter.post(
  "/signup",
  validateRequestBody(postSignupBodySchema),
  postSignupHandler,
);
authRouter.post(
  "/login",
  validateRequestBody(postLoginBodySchema),
  postLoginHandler,
);
authRouter.get("/me", requireLoginMiddleware, getCurrentUserHandler);

export default authRouter;
