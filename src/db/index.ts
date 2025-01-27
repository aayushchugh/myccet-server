import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({
	connection: {
		user: process.env.DB_POSTGRES_USER!,
		password: process.env.DB_POSTGRES_PASSWORD!,
		database: process.env.DB_POSTGRES_DB!,
		host: process.env.DB_POSTGRES_HOST!,
		port: Number(process.env.DB_POSTGRES_PORT!),
		ssl: false,
	},
});

export default db;
