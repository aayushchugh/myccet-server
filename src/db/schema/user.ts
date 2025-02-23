import { InferSelectModel, sql } from "drizzle-orm";
import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export enum Role {
  ADMIN = "admin",
  FACULTY = "faculty",
}

export enum Designation {
  HOD = "hod",
  LECTURER = "lecturer",
  Maintenance = "maintenance",
}

export const userTable = pgTable("user", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  first_name: varchar({ length: 255 }).notNull(),
  middle_name: varchar({ length: 255 }),
  last_name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  phone: integer().unique().notNull(),
  role: varchar({ length: 255 }).notNull().default("faculty"),
  designation: varchar({ length: 255 }).notNull().default("lecturer"),
  created_at: timestamp({ mode: "date" }).defaultNow(),
  updated_at: timestamp({ mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at")
    .default(sql`null`)
    .$type<Date | null>(),
});

export type User = InferSelectModel<typeof userTable>;
