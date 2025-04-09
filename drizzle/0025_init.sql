CREATE TABLE "batchSemester" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "batchSemester_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"batch_id" integer NOT NULL,
	"semester_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "batch" DROP CONSTRAINT "batch_sem_1_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "batch" DROP CONSTRAINT "batch_sem_2_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "batch" DROP CONSTRAINT "batch_sem_3_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "batch" DROP CONSTRAINT "batch_sem_4_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "batch" DROP CONSTRAINT "batch_sem_5_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "batch" DROP CONSTRAINT "batch_sem_6_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "batch" DROP CONSTRAINT "batch_sem_7_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "batch" DROP CONSTRAINT "batch_sem_8_semester_id_fk";
--> statement-breakpoint
ALTER TABLE "batchSemester" ADD CONSTRAINT "batchSemester_batch_id_branch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."branch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batchSemester" ADD CONSTRAINT "batchSemester_semester_id_semester_id_fk" FOREIGN KEY ("semester_id") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "sem_1";--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "sem_2";--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "sem_3";--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "sem_4";--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "sem_5";--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "sem_6";--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "sem_7";--> statement-breakpoint
ALTER TABLE "batch" DROP COLUMN "sem_8";