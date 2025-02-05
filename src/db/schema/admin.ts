import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const adminTable = pgTable("admin", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	first_name: varchar({ length: 255 }).notNull(),
	middle_name: varchar({ length: 255 }),
	last_name: varchar({ length: 255 }),
	email: varchar({ length: 255 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
	phone: integer().unique().notNull(),
	created_at: timestamp({ mode: "date" }).defaultNow(),
	updated_at: timestamp({ mode: "date" }).defaultNow(),
});
