import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "@/modules/health/health.routes";
import logger, { LoggerServices } from "./libs/logger";
import authRouter from "./modules/auth/auth.routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/health", healthRouter);
app.use("/auth", authRouter);

const PORT = process.env.PORT || 8000;

(async () => {
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`, "SYSTEM");
	});
})();
