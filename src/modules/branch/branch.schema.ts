import { z } from "zod";

export const postCreateBranchSchema = z.object({
  title: z.string({ required_error: "Please enter a title" }),
});

export type PostCreateBranchBody = z.infer<typeof postCreateBranchSchema>;

export const putUpdateBranchSchema = z.object({
  title: z.string().optional(),
});

export type PutUpdateBranchBody = z.infer<typeof putUpdateBranchSchema>;
