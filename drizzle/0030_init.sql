ALTER TABLE "exam_marks" RENAME TO "student_marks";--> statement-breakpoint
ALTER TABLE "student_marks" DROP CONSTRAINT "exam_marks_student_id_student_id_fk";
--> statement-breakpoint
ALTER TABLE "student_marks" DROP CONSTRAINT "exam_marks_subject_id_subject_id_fk";
--> statement-breakpoint
ALTER TABLE "student_marks" ALTER COLUMN "internal_marks" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "student_marks" ALTER COLUMN "external_marks" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "student_marks" ADD COLUMN "semester_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "student_marks" ADD COLUMN "total_marks" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "student_marks" ADD COLUMN "is_pass" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "internal_passing_marks" integer DEFAULT 20 NOT NULL;--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "external_passing_marks" integer DEFAULT 20 NOT NULL;--> statement-breakpoint
ALTER TABLE "student_marks" ADD CONSTRAINT "student_marks_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_marks" ADD CONSTRAINT "student_marks_semester_id_semester_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_marks" ADD CONSTRAINT "student_marks_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject" DROP COLUMN "internal_marks";--> statement-breakpoint
ALTER TABLE "subject" DROP COLUMN "external_marks";