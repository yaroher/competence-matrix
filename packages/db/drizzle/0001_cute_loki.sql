CREATE TYPE "public"."org_unit_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."org_unit_type" AS ENUM('company', 'department', 'team');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('active', 'archived');--> statement-breakpoint
ALTER TABLE "org_units" ALTER COLUMN "type" SET DATA TYPE "public"."org_unit_type" USING "type"::"public"."org_unit_type";--> statement-breakpoint
ALTER TABLE "org_units" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."org_unit_status";--> statement-breakpoint
ALTER TABLE "org_units" ALTER COLUMN "status" SET DATA TYPE "public"."org_unit_status" USING "status"::"public"."org_unit_status";--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."organization_status";--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "status" SET DATA TYPE "public"."organization_status" USING "status"::"public"."organization_status";--> statement-breakpoint
CREATE UNIQUE INDEX "org_units_organization_parent_name_uq" ON "org_units" USING btree ("organization_id","parent_id","name");--> statement-breakpoint
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_no_self_parent" CHECK ("org_units"."parent_id" IS NULL OR "org_units"."parent_id" <> "org_units"."id");