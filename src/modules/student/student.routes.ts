import { Router } from "express";
import {
	postCreateStudentHandler,
	getAllStudentsHandler,
	getStudentHandler,
	putStudentHandler,
	deleteStudentHandler,
	postMarksHandler,
	putMarksHandler,
	getStudentSemestersHandler,
	getSemesterMarksHandler,
	deleteSemesterMarksHandler,
	getProvisionalCertificateHandler,
} from "./student.controller";
import { requireRoleMiddleware } from "@/middlewares/require-role.middleware";
import { validateRequestBody } from "@/middlewares/validate-request.middleware";
import {
	postCreateStudentSchema,
	postMarksSchema,
	putMarksSchema,
	putStudentSchema,
} from "./student.schema";
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

// Marks routes
studentRouter.post(
	"/:id/marks",
	validateRequestBody(postMarksSchema),
	postMarksHandler
);
studentRouter.put(
	"/:id/marks",
	validateRequestBody(putMarksSchema),
	putMarksHandler
);
studentRouter.get("/:id/semesters", getStudentSemestersHandler);
studentRouter.get(
	"/:student_id/semesters/:semester_id/marks",
	getSemesterMarksHandler
);
studentRouter.delete(
	"/:student_id/semesters/:semester_id/marks",
	deleteSemesterMarksHandler
);

studentRouter.get(
	"/:id/certificate/provisional",
	getProvisionalCertificateHandler
);

export default studentRouter;
