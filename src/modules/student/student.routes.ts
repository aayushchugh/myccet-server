import { Router } from "express";
import {
	postCreateStudentHandler,
	getStudentHandler,
	getAllStudentsHandler,
	putStudentHandler,
	deleteStudentHandler,
} from "./student.controller";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import { postCreateStudentSchema, putStudentSchema } from "./student.schema";
import { Role } from "@/db/schema/user";

const studentRouter = Router();

studentRouter.post(
	"/",
	requireRoleMiddleware(Role.ADMIN),
	validateRequestBody(postCreateStudentSchema),
	postCreateStudentHandler
);

studentRouter.get(
	"/",
	requireRoleMiddleware(Role.ADMIN),
	getAllStudentsHandler
);

studentRouter.get("/:id", requireRoleMiddleware(Role.ADMIN), getStudentHandler);

studentRouter.put(
	"/:id",
	requireRoleMiddleware(Role.ADMIN),
	validateRequestBody(putStudentSchema),
	putStudentHandler
);

studentRouter.delete(
	"/:id",
	requireRoleMiddleware(Role.ADMIN),
	deleteStudentHandler
);

export default studentRouter;
