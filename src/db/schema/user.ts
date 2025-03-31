import { InferSelectModel, sql } from "drizzle-orm";
import { branchTable } from "./branch";

import {
  integer,
  pgTable,
  varchar,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";
import { semesterTable } from "./semester";

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
  deleted_at: timestamp("deleted_at")
    .default(sql`null`)
    .$type<Date | null>(),
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
  deleted_at: timestamp("deleted_at")
    .default(sql`null`)
    .$type<Date | null>(),
});

export const studentTable = pgTable("student", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  branch_id: integer()
    .notNull()
    .references(() => branchTable.id, { onDelete: "cascade" }),
  // Add any student-specific fields here
  registration_number: bigint({ mode: "number" }).notNull().unique(),
  father_name: varchar({ length: 255 }).notNull(),
  mother_name: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 255 }).notNull(),
  current_semester_id: integer()
    .notNull()
    .references(() => semesterTable.id, { onDelete: "cascade" }),
  created_at: timestamp({ mode: "date" }).defaultNow(),
  updated_at: timestamp({ mode: "date" }).defaultNow(),
  deleted_at: timestamp("deleted_at")
    .default(sql`null`)
    .$type<Date | null>(),
});

export type User = InferSelectModel<typeof userTable>;
export type Admin = InferSelectModel<typeof adminTable>;
export type Faculty = InferSelectModel<typeof facultyTable>;
export type Student = InferSelectModel<typeof studentTable>;
