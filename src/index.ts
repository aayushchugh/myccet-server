import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "@/modules/health/health.routes";
import logger, { LoggerServices } from "./libs/logger";
import authRouter from "./modules/auth/auth.routes";
import cookieParser from "cookie-parser";
import { requireLoginMiddleware } from "./middlewares/require-login.middleware";
import adminRouter from "./modules/admin/admin.router";
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware";
import { requireRoleMiddleware } from "./middlewares/require-role.middleware";
import { Role } from "./db/schema/user";
import subjectRouter from "./modules/subject/subject.routes";
import semesterRouter from "./modules/semester/semester.routes";
import branchRouter from "./modules/branch/branch.routes";

const app = express();

app.use(
	cors({
		credentials: true,
		origin: ["http://localhost:3000", "https://myccet.infyfix.com"],
	})
);
app.use(express.json());
app.use(cookieParser());

app.use(requestLoggerMiddleware);

app.use("/health", healthRouter);
app.use("/auth", authRouter);

// Only allow logged in users to access the following routes
app.use(requireLoginMiddleware);
app.use("/admin", requireRoleMiddleware(Role.ADMIN), adminRouter);
app.use("/subjects", subjectRouter);
app.use("/semesters", semesterRouter);
app.use("/branches", branchRouter);
app.use("/faculty", authRouter);

const PORT = process.env.PORT || 8000;

(async () => {
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`, "SYSTEM");
	});
})();
