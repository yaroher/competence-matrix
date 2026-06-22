CREATE TYPE "public"."calibration_session_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TABLE "calibration_decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"assessment_score_id" text NOT NULL,
	"original_level" integer NOT NULL,
	"calibrated_level" integer NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calibration_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"status" "calibration_session_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calibration_decisions" ADD CONSTRAINT "calibration_decisions_session_id_calibration_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."calibration_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calibration_decisions" ADD CONSTRAINT "calibration_decisions_assessment_score_id_assessment_scores_id_fk" FOREIGN KEY ("assessment_score_id") REFERENCES "public"."assessment_scores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calibration_sessions" ADD CONSTRAINT "calibration_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calibration_decisions_session_idx" ON "calibration_decisions" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "calibration_decisions_session_score_uq" ON "calibration_decisions" USING btree ("session_id","assessment_score_id");--> statement-breakpoint
CREATE INDEX "calibration_sessions_organization_idx" ON "calibration_sessions" USING btree ("organization_id");