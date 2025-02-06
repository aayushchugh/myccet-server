import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { InferSelectModel } from "drizzle-orm";

export const sessionTable = pgTable("session", {
	id: varchar({ length: 255 }).primaryKey(),
	user_id: integer()
		.notNull()
		.references(() => userTable.id),
	expires_at: timestamp({
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export type Session = InferSelectModel<typeof sessionTable>;
