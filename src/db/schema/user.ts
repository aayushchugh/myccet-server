import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	firstName: varchar({ length: 255 }).notNull(),
	middleName: varchar({ length: 255 }),
	lastName: varchar({ length: 255 }),
	email: varchar({ length: 255 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
});
