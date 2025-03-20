import { InferSelectModel, sql } from "drizzle-orm";
import { branchTable } from "./branch";
import {
  integer,
  pgTable,
  varchar,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";

export enum Role {
  ADMIN = "admin",
  FACULTY = "faculty",
  STUDENT = "student",
}

export enum Designation {
  HOD = "hod",
  LECTURER = "lecturer",
  MAINTENANCE = "maintenance",
  PRINCIPAL = "principal",
  TUTOR = "tutor",
}

// Base users table with common fields
export const userTable = pgTable("user", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  first_name: varchar({ length: 255 }).notNull(),
  middle_name: varchar({ length: 255 }),
  last_name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  phone: bigint({
    mode: "number",
  })
    .unique()
    .notNull(),
  role: varchar({ length: 255 }).notNull().default(Role.FACULTY),
  created_at: timestamp({ mode: "date" }).defaultNow(),
  updated_at: timestamp({ mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at")
    .default(sql`null`)
    .$type<Date | null>(),
});

// Admin-specific details
export const adminTable = pgTable("admin", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  designation: varchar({ length: 255 })
    .notNull()
    .default(Designation.PRINCIPAL),
  // Add any admin-specific fields here
  created_at: timestamp({ mode: "date" }).defaultNow(),
  updated_at: timestamp({ mode: "date" }).defaultNow(),
});

// Faculty-specific details
export const facultyTable = pgTable("faculty", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  designation: varchar({ length: 255 }).notNull().default(Designation.LECTURER),
  branch_id: integer()
    .notNull()
    .references(() => branchTable.id, { onDelete: "cascade" }),
  // Add any faculty-specific fields here

  created_at: timestamp({ mode: "date" }).defaultNow(),
  updated_at: timestamp({ mode: "date" }).defaultNow(),
});

export const StudentTable = pgTable("student", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  branch_id: integer()
    .notNull()
    .references(() => branchTable.id, { onDelete: "cascade" }),
  // Add any student-specific fields here
  registration_number: integer().notNull().unique(),
  created_at: timestamp({ mode: "date" }).defaultNow(),
  updated_at: timestamp({ mode: "date" }).defaultNow(),
});

export type User = InferSelectModel<typeof userTable>;
export type Admin = InferSelectModel<typeof adminTable>;
export type Faculty = InferSelectModel<typeof facultyTable>;
