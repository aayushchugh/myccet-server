import { createLogger, format, transports } from "winston";

const { combine, timestamp, json } = format;

const loggerUtil = createLogger({
	level: "error",
	format: combine(timestamp(), json()),
	transports: [
		new transports.Console({ level: "error" }),
		new transports.Console({ level: "info" }),
		new transports.File({ filename: "logs/error.log", level: "error" }),
		new transports.File({ filename: "logs/app.log" }),
	],
});

export default loggerUtil;
