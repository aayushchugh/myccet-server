ALTER TABLE "batchSemester" RENAME TO "batch_semester";--> statement-breakpoint
ALTER TABLE "batch_semester" DROP CONSTRAINT "batchSemester_batch_id_branch_id_fk";
--> statement-breakpoint
ALTER TABLE "batch_semester" DROP CONSTRAINT "batchSemester_semester_id_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "batch_semester" ADD CONSTRAINT "batch_semester_batch_id_branch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_semester" ADD CONSTRAINT "batch_semester_semester_id_semester_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;