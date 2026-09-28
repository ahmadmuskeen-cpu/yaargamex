CREATE TABLE "general_updates" (
	"id" serial PRIMARY KEY,
	"type" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"body" text,
	"media_url" text,
	"media_mime" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
