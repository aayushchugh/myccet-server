ALTER TABLE "batch_semester" DROP CONSTRAINT "batch_semester_batch_id_branch_id_fk";
--> statement-breakpoint
ALTER TABLE "batch_semester" ADD CONSTRAINT "batch_semester_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE cascade ON UPDATE no action;