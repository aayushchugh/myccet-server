ALTER TABLE "admin" ADD COLUMN "deleted_at" timestamp DEFAULT null;--> statement-breakpoint
ALTER TABLE "faculty" ADD COLUMN "deleted_at" timestamp DEFAULT null;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "deleted_at" timestamp DEFAULT null;