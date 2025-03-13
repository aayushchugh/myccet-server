import { InferSelectModel, sql } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const branchTable = pgTable("branch", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull().unique(),
	created_at: timestamp({ mode: "date" }).defaultNow(),
	updated_at: timestamp({ mode: "date" }).defaultNow(),
	deleted_at: timestamp("deleted_at")
		.default(sql`null`)
		.$type<Date | null>(),
});

export type Branch = InferSelectModel<typeof branchTable>;
