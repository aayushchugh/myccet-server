ALTER TABLE "subject" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "deleted_at" timestamp DEFAULT null;