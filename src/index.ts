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

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(requestLoggerMiddleware);

app.use("/health", healthRouter);
app.use("/auth", authRouter);

// Only allow logged in users to access the following routes
app.use(requireLoginMiddleware);
app.use("/admin", adminRouter);

const PORT = process.env.PORT || 8000;

(async () => {
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`, "SYSTEM");
	});
})();
