import { z } from "zod";
import { Designation } from "../../db/schema/user";

const instituteDomain = process.env.INSTITUTE_DOMAIN;
if (!instituteDomain) {
  throw new Error(
    "INSTITUTE_DOMAIN is not defined in the environment variables."
  );
}

const emailRegex = new RegExp(
  `^[a-zA-Z0-9._%+-]+@${instituteDomain.replace(/\./g, "\\.")}$`
);

export const postFacultyBodySchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password should be at least 6 characters" }),
  first_name: z.string({ required_error: "First name is required" }),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z
    .string()
    .length(10, { message: "Phone number must be exactly 10 digits" }),
  designation: z.enum([
    Designation.HOD,
    Designation.LECTURER,
    Designation.Tutor,
  ]),
});

export type PostFacultyBody = z.infer<typeof postFacultyBodySchema>;

export const putFacultyBodySchema = z.object({
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().length(10).optional(),
  designation: z
    .enum([Designation.HOD, Designation.LECTURER, Designation.Tutor])
    .optional(),
});

export type PutFacultyBody = z.infer<typeof putFacultyBodySchema>;
