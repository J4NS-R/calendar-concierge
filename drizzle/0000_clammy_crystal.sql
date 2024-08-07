CREATE TABLE IF NOT EXISTS "busy_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"remote_ics_id" integer NOT NULL,
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "remote_ics" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"username" text,
	"password" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "busy_events" ADD CONSTRAINT "busy_events_remote_ics_id_remote_ics_id_fk" FOREIGN KEY ("remote_ics_id") REFERENCES "public"."remote_ics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
