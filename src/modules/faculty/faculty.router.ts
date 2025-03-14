import { Router } from "express";
import { requireRoleMiddleware } from "../../middlewares/require-role.middleware";
import { Role } from "../../db/schema/user";
import {
	deleteAdminHandler,
	getAdminHandler,
	getAllAdminsHandler,
	postAdminHandler,
	putAdminHandler,
} from "./faculty.controller";
import { validateRequestBody } from "../../middlewares/validate-request.middleware";
import { postFacultyBodySchema } from "./faculty.schema";

const facultyRouter = Router();

facultyRouter.post(
	"/",
	requireRoleMiddleware(Role.ADMIN),
	validateRequestBody(postFacultyBodySchema),
	postAdminHandler
);

facultyRouter.get("/", getAllAdminsHandler);
facultyRouter
	.route("/:id/")
	.get(getAdminHandler)
	.delete(deleteAdminHandler)
	.put(putAdminHandler);

export default facultyRouter;
