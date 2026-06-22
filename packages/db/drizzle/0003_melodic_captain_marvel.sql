CREATE TYPE "public"."assignment_status" AS ENUM('active', 'archived');--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "status" "assignment_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
CREATE INDEX "assignments_status_idx" ON "assignments" USING btree ("status");