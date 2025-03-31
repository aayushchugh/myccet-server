import { z } from "zod";

const instituteDomain = process.env.INSTITUTE_DOMAIN;
if (!instituteDomain) {
  throw new Error(
    "INSTITUTE_DOMAIN is not defined in the environment variables.",
  );
}

const emailRegex = new RegExp(
  `^[a-zA-Z0-9._%+-]+@${instituteDomain.replace(/\./g, "\\.")}$`,
);

export const postCreateStudentSchema = z.object({
  first_name: z.string({ required_error: "Please enter first name" }),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z
    .string()
    .email({ message: "Please enter a valid email" })
    .regex(emailRegex, `Email must be on ${instituteDomain} domain`),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  phone: z.number({ required_error: "Please enter phone number" }),
  branch_id: z.number({ required_error: "Please select a branch" }),
  registration_number: z.number({
    required_error: "Please enter registration number",
  }),
  current_semester_id: z.number({
    required_error: "Please select current semester",
  }),
  father_name: z.string({ required_error: "Please enter father name" }),
  mother_name: z.string({ required_error: "Please enter mother name" }),
  category: z.string({ required_error: "Please enter category" }),
});

export const putStudentSchema = z.object({
  first_name: z.string().optional(),
  middle_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z
    .string()
    .email({ message: "Please enter a valid email" })
    .regex(emailRegex, `Email must be on ${instituteDomain} domain`)
    .optional(),
  phone: z.number().optional(),
  branch_id: z.number({ message: "branch id should be a number" }).optional(),
  current_semester_id: z.number().optional(),
  registration_number: z.number().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  category: z.string().optional(),
});

export type PutStudentBody = z.infer<typeof putStudentSchema>;
