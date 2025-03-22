import { z } from "zod";

export const postCreateSemesterSchema = z.object({
  title: z.string({ required_error: "Please enter a title" }),
  branch_id: z.number({ required_error: "Please select a branch" }),
  subject_ids: z.array(z.number(), {
    required_error: "Please select subjects",
  }),
  start_date: z.string({ required_error: "Please enter a start date" }),
  end_date: z.string({ required_error: "Please enter an end date" }),
});

export type PostCreateSemesterBody = z.infer<typeof postCreateSemesterSchema>;

export const putUpdateSemesterSchema = z.object({
  title: z.string().optional(),
  branch_id: z.number().optional(),
  subject_ids: z.array(z.number()).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type PutUpdateSemesterBody = z.infer<typeof putUpdateSemesterSchema>;
