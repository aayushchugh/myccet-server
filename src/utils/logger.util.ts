import { createLogger, format, transports } from "winston";

const { combine, timestamp, json } = format;

class Logger {
	private errorLogger = createLogger({
		level: "error",
		format: combine(timestamp(), json()),
		transports: [
			new transports.Console(),
			new transports.File({ filename: "logs/error.log", level: "error" }),
		],
	});

	private securityLogger = createLogger({
		level: "warn",
		format: combine(timestamp(), json()),
		transports: [
			new transports.Console(),
			new transports.File({ filename: "logs/security.log", level: "warn" }),
		],
	});

	private httpLogger = createLogger({
		level: "http",
		format: combine(timestamp(), json()),
		transports: [
			new transports.Console(),
			new transports.File({ filename: "logs/http.log", level: "http" }),
		],
	});

	private dbLogger = createLogger({
		level: "verbose",
		format: combine(timestamp(), json()),
		transports: [
			new transports.Console(),
			new transports.File({ filename: "logs/db.log", level: "verbose" }),
		],
	});

	private operationLogger = createLogger({
		level: "info",
		format: combine(timestamp(), json()),
		transports: [
			new transports.Console(),
			new transports.File({ filename: "logs/operation.log", level: "info" }),
		],
	});

	error(message: string) {
		this.errorLogger.error(message);
	}

	security(message: string) {
		this.securityLogger.warn(message);
	}

	http(message: string) {
		this.httpLogger.http(message);
	}

	db(message: string) {
		this.dbLogger.verbose(message);
	}

	operation(message: string) {
		this.operationLogger.info(message);
	}
}

export default new Logger();
