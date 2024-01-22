import express from "express";
import prisma from "./prisma/prisma";
import logger from "./utils/logger.util";
import authRouter from "./modules/auth/auth.routes";

const app = express();

/* -------------------------------------------------------------------------- */
/*                                 middlewares                                */
/* -------------------------------------------------------------------------- */

app.use(express.json());

/* -------------------------------------------------------------------------- */
/*                                   routes                                   */
/* -------------------------------------------------------------------------- */

app.use("/api", authRouter);

(async () => {
	try {
		const PORT = process.env.PORT || 8000;

		await prisma.$connect();
		logger.operation("Connected to database");
		app.listen(PORT);

		logger.operation(`Server started on port ${PORT}`);
	} catch (err) {
		console.log(err);
	}
})();
