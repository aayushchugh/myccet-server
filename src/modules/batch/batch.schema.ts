import { z } from "zod";
import { BatchType } from "../../db/schema/batch";

export const postBatchSchema = z.object({
	start_year: z
		.string({ required_error: "Please enter a start year" })
		.date("Please enter a valid date"),
	end_year: z
		.string({ required_error: "Please enter a end year " })
		.date("Please enter a valid date"),
	branch_id: z.number({ required_error: "Please enter branch id" }),
	type: z.nativeEnum(BatchType, {
		required_error: "Please select type",
		invalid_type_error: "Batch can be either 'regular' or 'ptd'",
	}),
});

export type PostBatchSchema = z.infer<typeof postBatchSchema>;

export const postBatchDetailsSchema = z.object({
	semesters: z
		.object({
			id: z.number({ required_error: "id is required" }),
			start_date: z
				.string({ required_error: "Please enter a start year" })
				.date("Please enter a valid date"),
			end_date: z
				.string({ required_error: "Please enter a end year " })
				.date("Please enter a valid date"),
			subject_ids: z
				.number({ required_error: "Please select at least one subject" })
				.array(),
		})
		.array(),
});

export type PostBatchDetailsSchema = z.infer<typeof postBatchDetailsSchema>;
