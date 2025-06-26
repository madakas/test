-- Remove or comment out these if they already exist:
-- CREATE TABLE "boards" ( ... );
-- CREATE TABLE "columns" ( ... );
-- CREATE TABLE "cards" ( ... );

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text NOT NULL,
	"auth0_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_auth0_id_unique" UNIQUE("auth0_id")
);