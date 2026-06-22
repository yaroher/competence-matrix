CREATE TYPE "public"."level_dimension" AS ENUM('autonomy', 'complexity', 'influence', 'support', 'impact');--> statement-breakpoint
CREATE TYPE "public"."methodology_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TABLE "level_dimension_descriptors" (
	"id" text PRIMARY KEY NOT NULL,
	"scale_id" text NOT NULL,
	"level_value" integer NOT NULL,
	"dimension" "level_dimension" NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "level_scales" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"status" "methodology_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scoring_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"confidence_threshold" numeric(3, 2) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"status" "methodology_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "level_definitions" ADD COLUMN "scale_id" text;--> statement-breakpoint
ALTER TABLE "level_dimension_descriptors" ADD CONSTRAINT "level_dimension_descriptors_scale_id_level_scales_id_fk" FOREIGN KEY ("scale_id") REFERENCES "public"."level_scales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_scales" ADD CONSTRAINT "level_scales_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scoring_rules" ADD CONSTRAINT "scoring_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "level_dimension_descriptors_scale_idx" ON "level_dimension_descriptors" USING btree ("scale_id");--> statement-breakpoint
CREATE UNIQUE INDEX "level_dimension_descriptors_scale_level_dim_uq" ON "level_dimension_descriptors" USING btree ("scale_id","level_value","dimension");--> statement-breakpoint
CREATE INDEX "level_scales_organization_idx" ON "level_scales" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "level_scales_organization_default_uq" ON "level_scales" USING btree ("organization_id","is_default");--> statement-breakpoint
CREATE INDEX "scoring_rules_organization_idx" ON "scoring_rules" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "scoring_rules_organization_default_uq" ON "scoring_rules" USING btree ("organization_id","is_default");--> statement-breakpoint
ALTER TABLE "level_definitions" ADD CONSTRAINT "level_definitions_scale_id_level_scales_id_fk" FOREIGN KEY ("scale_id") REFERENCES "public"."level_scales"("id") ON DELETE no action ON UPDATE no action;