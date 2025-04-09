ALTER TABLE "batch_semester" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "batch_semester" CASCADE;--> statement-breakpoint
ALTER TABLE "semester" ADD COLUMN "batch_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "semester" ADD CONSTRAINT "semester_batch_id_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE cascade ON UPDATE no action;