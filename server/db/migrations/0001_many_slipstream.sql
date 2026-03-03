CREATE TABLE IF NOT EXISTS "pool_custom_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"pool_id" integer NOT NULL,
	"question" text NOT NULL,
	"correct_answer" text NOT NULL,
	"wrong_answer_1" text NOT NULL,
	"wrong_answer_2" text NOT NULL,
	"wrong_answer_3" text NOT NULL,
	"tier" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pool_vocab_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"pool_id" integer NOT NULL,
	"term" text NOT NULL,
	"definition" text NOT NULL,
	"symbol" text,
	"tier" integer NOT NULL,
	"category" text NOT NULL,
	"format" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_pools" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"name" text NOT NULL,
	"game_code" text NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"use_defaults" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "question_pools_game_code_unique" UNIQUE("game_code")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "google_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'player' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pool_custom_questions" ADD CONSTRAINT "pool_custom_questions_pool_id_question_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."question_pools"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pool_vocab_entries" ADD CONSTRAINT "pool_vocab_entries_pool_id_question_pools_id_fk" FOREIGN KEY ("pool_id") REFERENCES "public"."question_pools"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_pools" ADD CONSTRAINT "question_pools_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_google_id_unique" UNIQUE("google_id");