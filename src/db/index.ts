import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({
	connection: {
		user: process.env.POSTGRES_USER!,
		password: process.env.POSTGRES_PASSWORD!,
		database: process.env.POSTGRES_DB!,
		host: process.env.POSTGRES_HOST!,
		port: Number(process.env.POSTGRES_PORT!),
		ssl: false,
	},
});

export default db;
