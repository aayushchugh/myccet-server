import { Role } from "@/db/schema/user";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import { Router } from "express";
import {
	postCreateSemesterSchema,
	putUpdateSemesterSchema,
} from "./semester.schema";
import {
	deleteSemesterHandler,
	getAllSemestersHandler,
	getSemesterHandler,
	// postSemesterHandler,
	putSemesterHandler,
} from "./semester.controller";

const semesterRouter = Router();

semesterRouter
	.route("/")
	// .post(
	// 	requireRoleMiddleware(Role.ADMIN),
	// 	validateRequestBody(postCreateSemesterSchema),
	// 	postSemesterHandler
	// )
	.get(getAllSemestersHandler);

semesterRouter
	.route("/:id")
	.get(getSemesterHandler)
	.put(
		requireRoleMiddleware(Role.ADMIN),
		validateRequestBody(putUpdateSemesterSchema),
		putSemesterHandler
	)
	.delete(requireRoleMiddleware(Role.ADMIN), deleteSemesterHandler);

export default semesterRouter;
