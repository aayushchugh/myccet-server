import express from "express";
import prisma from "./prisma/prisma";
import logger from "./utils/logger.util";

const app = express();

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
