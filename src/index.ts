import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "@/modules/health/health.routes";
import logger, { LoggerServices } from "./libs/logger";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRouter);

const PORT = process.env.PORT || 8000;

(async () => {
	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`, "SYSTEM");
	});
})();
