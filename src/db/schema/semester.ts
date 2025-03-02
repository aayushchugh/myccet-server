import { InferSelectModel, sql } from "drizzle-orm";
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const semesterTable = pgTable("semester", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  start_date: timestamp({ mode: "date" }).notNull(),
  end_date: timestamp({ mode: "date" }).notNull(),
  created_at: timestamp({ mode: "date" }).defaultNow(),
  updated_at: timestamp({ mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at")
    .default(sql`null`)
    .$type<Date | null>(),
});

export type Semester = InferSelectModel<typeof semesterTable>;
