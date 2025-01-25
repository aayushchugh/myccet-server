import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema/*",
	dialect: "postgresql",
	dbCredentials: {
		user: process.env.DB_POSTGRES_USER!,
		password: process.env.DB_POSTGRES_PASSWORD!,
		database: process.env.DB_POSTGRES_DB!,
		host: process.env.DB_POSTGRES_HOST!,
		port: Number(process.env.DB_POSTGRES_PORT!),
		ssl: false,
	},
	casing: "snake_case",
});
