ALTER TABLE "batch" ADD COLUMN "sem_1" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "sem_2" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "sem_3" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "sem_4" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "sem_5" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "sem_6" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "sem_7" integer;--> statement-breakpoint
ALTER TABLE "batch" ADD COLUMN "sem_8" integer;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_sem_1_semester_id_fk" FOREIGN KEY ("sem_1") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_sem_2_semester_id_fk" FOREIGN KEY ("sem_2") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_sem_3_semester_id_fk" FOREIGN KEY ("sem_3") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_sem_4_semester_id_fk" FOREIGN KEY ("sem_4") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_sem_5_semester_id_fk" FOREIGN KEY ("sem_5") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_sem_6_semester_id_fk" FOREIGN KEY ("sem_6") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_sem_7_semester_id_fk" FOREIGN KEY ("sem_7") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_sem_8_semester_id_fk" FOREIGN KEY ("sem_8") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;