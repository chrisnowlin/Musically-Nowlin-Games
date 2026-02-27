CREATE TABLE IF NOT EXISTS "battle_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"player1_id" integer NOT NULL,
	"player2_id" integer,
	"winner_id" integer,
	"battle_type" text NOT NULL,
	"duration_ms" integer,
	"turn_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"class" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"hp" integer DEFAULT 100 NOT NULL,
	"max_hp" integer DEFAULT 100 NOT NULL,
	"skill_points" integer DEFAULT 0 NOT NULL,
	"region_progress" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"equipped_instrument" text,
	"equipped_spells" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"owned_instruments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"owned_spells" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"skill_tree" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matchmaking_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"level_bracket" integer NOT NULL,
	"status" text DEFAULT 'searching' NOT NULL,
	"battle_room_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "battle_history" ADD CONSTRAINT "battle_history_player1_id_characters_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "battle_history" ADD CONSTRAINT "battle_history_player2_id_characters_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "battle_history" ADD CONSTRAINT "battle_history_winner_id_characters_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matchmaking_sessions" ADD CONSTRAINT "matchmaking_sessions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
