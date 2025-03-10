CREATE TABLE "branch" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "branch_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp DEFAULT null
);
