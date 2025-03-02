import { z } from "zod";

export const postCreateSemesterSchema = z.object({
  title: z.string({ required_error: "Please enter a title" }),
  start_date: z.string({ required_error: "Please enter a start date" }),
  end_date: z.string({ required_error: "Please enter an end date" }),
});

export type PostCreateSemesterBody = z.infer<typeof postCreateSemesterSchema>;
