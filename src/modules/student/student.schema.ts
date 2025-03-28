import { z } from "zod";

const instituteDomain = process.env.INSTITUTE_DOMAIN;
if (!instituteDomain) {
  throw new Error(
    "INSTITUTE_DOMAIN is not defined in the environment variables."
  );
}

const emailRegex = new RegExp(
  `^[a-zA-Z0-9._%+-]+@${instituteDomain.replace(/\./g, "\\.")}$`
);

export const postStudentBodySchema = z.object({
  first_name: z.string({ required_error: "First name is required" }),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  registration_number: z.string({
    required_error: "Registration number is required",
  }),
  email: z
    .string()
    .email({ message: "Please enter a valid email" })
    .regex(emailRegex, `Email must be on ${instituteDomain} domain`),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }),
  fathers_name: z.string({ required_error: "Father's name is required" }),
  mothers_name: z.string({ required_error: "Mother's name is required" }),
  category: z.string({ required_error: "Category is required" }),
  semester_id: z.number({ required_error: "Semester ID is required" }),
  branch_id: z.number({ required_error: "Branch ID is required" }),
  course_type: z.string({ required_error: "Course type is required" }),
});

export type PostStudentBody = z.infer<typeof postStudentBodySchema>;

export const putStudentBodySchema = z.object({
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  registration_number: z.string().optional(),
  email: z.string().email().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" })
    .optional(),
  fathers_name: z.string().optional(),
  mothers_name: z.string().optional(),
  category: z.string().optional(),
  semester_id: z.number().optional(),
  branch_id: z.number().optional(),
  course_type: z.string().optional(),
});

export type PutStudentBody = z.infer<typeof putStudentBodySchema>;
