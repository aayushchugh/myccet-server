ALTER TABLE "users" RENAME TO "admin";--> statement-breakpoint
ALTER TABLE "admin" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "phone" varchar(255);--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "created_at" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "admin" ADD COLUMN "updated_at" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_email_unique" UNIQUE("email");