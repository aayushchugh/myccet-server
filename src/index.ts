import express from "express";
import prisma from "./prisma/prisma";
import logger from "./common/utils/logger.util";
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

/* -------------------------------------------------------------------------- */
/*                                launch server                               */
/* -------------------------------------------------------------------------- */

(async () => {
	try {
		const PORT = process.env.PORT || 8000;

		await prisma.$connect();
		logger.info("Connected to database");
		app.listen(PORT);

		logger.info(`Server started on port ${PORT}`);
	} catch (err) {
		console.log(err);
	}
})();
