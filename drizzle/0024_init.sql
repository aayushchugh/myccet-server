ALTER TABLE "batch" ALTER COLUMN "start_year" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "batch" ALTER COLUMN "start_year" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ALTER COLUMN "end_year" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "batch" ALTER COLUMN "end_year" DROP NOT NULL;