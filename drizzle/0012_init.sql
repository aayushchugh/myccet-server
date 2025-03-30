ALTER TABLE "faculty" DROP CONSTRAINT "faculty_registration_number_unique";--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "registration_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "faculty" DROP COLUMN "registration_number";--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_registration_number_unique" UNIQUE("registration_number");
