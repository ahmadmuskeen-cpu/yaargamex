CREATE TABLE "social_links" (
	"platform" text PRIMARY KEY,
	"url" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
