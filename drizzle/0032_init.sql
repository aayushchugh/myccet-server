ALTER TABLE "semester_subject" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "semester_subject" CASCADE;--> statement-breakpoint
ALTER TABLE "student_marks" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "student_marks" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "semester_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "subject" ADD CONSTRAINT "subject_semester_id_semester_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_marks" ADD CONSTRAINT "student_marks_student_id_subject_id_unique" UNIQUE("student_id","subject_id");