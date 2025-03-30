import { Router } from "express";
import {
	postCreateStudentHandler,
	getStudentHandler,
	getAllStudentsHandler,
} from "./student.controller";
import { requireLoginMiddleware } from "@/middlewares/require-login.middleware";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import { postCreateStudentSchema } from "./student.schema";
import { Role } from "@/db/schema/user";

const studentRouter = Router();

studentRouter.post(
	"/",
	requireLoginMiddleware,
	requireRoleMiddleware(Role.ADMIN),
	validateRequestBody(postCreateStudentSchema),
	postCreateStudentHandler
);

studentRouter.get(
	"/",
	requireLoginMiddleware,
	requireRoleMiddleware(Role.ADMIN),
	getAllStudentsHandler
);

studentRouter.get(
	"/:id",
	requireLoginMiddleware,
	requireRoleMiddleware(Role.ADMIN),
	getStudentHandler
);

export default studentRouter;
