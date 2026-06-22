CREATE TYPE "public"."assessment_source" AS ENUM('self', 'manager', 'expert', 'final');--> statement-breakpoint
CREATE TYPE "public"."criticality" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."source_kind" AS ENUM('system_seed', 'organization_custom', 'imported', 'external_mapping');--> statement-breakpoint
CREATE TYPE "public"."validation_status" AS ENUM('draft', 'reviewed', 'validated');--> statement-breakpoint
CREATE TABLE "assessment_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"competency_id" text NOT NULL,
	"source" "assessment_source" NOT NULL,
	"level" integer NOT NULL,
	"confidence" numeric(3, 2) NOT NULL,
	"verification_status" text NOT NULL,
	"comment" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"role_profile_id" text NOT NULL,
	"matrix_revision_id" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"org_unit_id" text NOT NULL,
	"manager_person_id" text,
	"role_profile_id" text NOT NULL,
	"effective_from" timestamp with time zone NOT NULL,
	"effective_to" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "competencies" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"category_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"source_kind" "source_kind" NOT NULL,
	"source_ref" text,
	"template_competency_id" text,
	"validation_status" "validation_status" DEFAULT 'draft' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"behavioral_indicators" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competency_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"parent_id" text,
	"category_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"source_kind" "source_kind" NOT NULL,
	"source_ref" text,
	"template_node_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competency_relations" (
	"id" text PRIMARY KEY NOT NULL,
	"source_competency_id" text NOT NULL,
	"target_competency_id" text NOT NULL,
	"relation_type" text NOT NULL,
	"strength" numeric(3, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "development_plan_items" (
	"id" text PRIMARY KEY NOT NULL,
	"development_plan_id" text NOT NULL,
	"competency_id" text NOT NULL,
	"gap" integer NOT NULL,
	"title" text NOT NULL,
	"owner_person_id" text NOT NULL,
	"status" text NOT NULL,
	"due_date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "development_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"assessment_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"rank" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "level_definitions" (
	"value" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matrices" (
	"id" text PRIMARY KEY NOT NULL,
	"role_profile_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"active_revision_id" text
);
--> statement-breakpoint
CREATE TABLE "matrix_requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"matrix_revision_id" text NOT NULL,
	"competency_id" text NOT NULL,
	"target_level" integer NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"normalized_weight" numeric(5, 4) NOT NULL,
	"weight_source" text NOT NULL,
	"criticality" "criticality" NOT NULL,
	"needed_on_entry" boolean DEFAULT false NOT NULL,
	"task_competency_link_id" text
);
--> statement-breakpoint
CREATE TABLE "matrix_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"matrix_id" text NOT NULL,
	"version" integer NOT NULL,
	"activated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "org_units" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"parent_id" text,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_families" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"grade_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"role_profile_id" text NOT NULL,
	"name" text NOT NULL,
	"expected_outcome" text NOT NULL,
	"criticality" "criticality" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"role_family_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_competency_links" (
	"id" text PRIMARY KEY NOT NULL,
	"role_task_id" text NOT NULL,
	"competency_id" text NOT NULL,
	"criticality" "criticality" NOT NULL,
	"needed_on_entry" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_role_profile_id_role_profiles_id_fk" FOREIGN KEY ("role_profile_id") REFERENCES "public"."role_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_matrix_revision_id_matrix_revisions_id_fk" FOREIGN KEY ("matrix_revision_id") REFERENCES "public"."matrix_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_org_unit_id_org_units_id_fk" FOREIGN KEY ("org_unit_id") REFERENCES "public"."org_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_manager_person_id_people_id_fk" FOREIGN KEY ("manager_person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_role_profile_id_role_profiles_id_fk" FOREIGN KEY ("role_profile_id") REFERENCES "public"."role_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competencies" ADD CONSTRAINT "competencies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competencies" ADD CONSTRAINT "competencies_category_id_competency_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."competency_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_categories" ADD CONSTRAINT "competency_categories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_relations" ADD CONSTRAINT "competency_relations_source_competency_id_competencies_id_fk" FOREIGN KEY ("source_competency_id") REFERENCES "public"."competencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_relations" ADD CONSTRAINT "competency_relations_target_competency_id_competencies_id_fk" FOREIGN KEY ("target_competency_id") REFERENCES "public"."competencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_plan_items" ADD CONSTRAINT "development_plan_items_development_plan_id_development_plans_id_fk" FOREIGN KEY ("development_plan_id") REFERENCES "public"."development_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_plan_items" ADD CONSTRAINT "development_plan_items_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_plan_items" ADD CONSTRAINT "development_plan_items_owner_person_id_people_id_fk" FOREIGN KEY ("owner_person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_plans" ADD CONSTRAINT "development_plans_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "development_plans" ADD CONSTRAINT "development_plans_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrices" ADD CONSTRAINT "matrices_role_profile_id_role_profiles_id_fk" FOREIGN KEY ("role_profile_id") REFERENCES "public"."role_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_requirements" ADD CONSTRAINT "matrix_requirements_matrix_revision_id_matrix_revisions_id_fk" FOREIGN KEY ("matrix_revision_id") REFERENCES "public"."matrix_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_requirements" ADD CONSTRAINT "matrix_requirements_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_requirements" ADD CONSTRAINT "matrix_requirements_task_competency_link_id_task_competency_links_id_fk" FOREIGN KEY ("task_competency_link_id") REFERENCES "public"."task_competency_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_revisions" ADD CONSTRAINT "matrix_revisions_matrix_id_matrices_id_fk" FOREIGN KEY ("matrix_id") REFERENCES "public"."matrices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_families" ADD CONSTRAINT "role_families_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_profiles" ADD CONSTRAINT "role_profiles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_profiles" ADD CONSTRAINT "role_profiles_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_tasks" ADD CONSTRAINT "role_tasks_role_profile_id_role_profiles_id_fk" FOREIGN KEY ("role_profile_id") REFERENCES "public"."role_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_role_family_id_role_families_id_fk" FOREIGN KEY ("role_family_id") REFERENCES "public"."role_families"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_competency_links" ADD CONSTRAINT "task_competency_links_role_task_id_role_tasks_id_fk" FOREIGN KEY ("role_task_id") REFERENCES "public"."role_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_competency_links" ADD CONSTRAINT "task_competency_links_competency_id_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."competencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessment_scores_competency_idx" ON "assessment_scores" USING btree ("competency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_scores_assessment_competency_source_uq" ON "assessment_scores" USING btree ("assessment_id","competency_id","source");--> statement-breakpoint
CREATE INDEX "assessments_person_idx" ON "assessments" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "assessments_role_profile_idx" ON "assessments" USING btree ("role_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessments_person_revision_uq" ON "assessments" USING btree ("person_id","matrix_revision_id");--> statement-breakpoint
CREATE INDEX "assignments_person_idx" ON "assignments" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "assignments_org_unit_idx" ON "assignments" USING btree ("org_unit_id");--> statement-breakpoint
CREATE INDEX "assignments_manager_idx" ON "assignments" USING btree ("manager_person_id");--> statement-breakpoint
CREATE INDEX "assignments_role_profile_idx" ON "assignments" USING btree ("role_profile_id");--> statement-breakpoint
CREATE INDEX "competencies_organization_idx" ON "competencies" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "competencies_category_idx" ON "competencies" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "competencies_organization_code_uq" ON "competencies" USING btree ("organization_id","code");--> statement-breakpoint
CREATE INDEX "competency_categories_organization_idx" ON "competency_categories" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "competency_categories_parent_idx" ON "competency_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "competency_categories_organization_name_uq" ON "competency_categories" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "competency_relations_source_idx" ON "competency_relations" USING btree ("source_competency_id");--> statement-breakpoint
CREATE INDEX "competency_relations_target_idx" ON "competency_relations" USING btree ("target_competency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "competency_relations_edge_uq" ON "competency_relations" USING btree ("source_competency_id","target_competency_id","relation_type");--> statement-breakpoint
CREATE INDEX "development_plan_items_plan_idx" ON "development_plan_items" USING btree ("development_plan_id");--> statement-breakpoint
CREATE INDEX "development_plan_items_competency_idx" ON "development_plan_items" USING btree ("competency_id");--> statement-breakpoint
CREATE INDEX "development_plan_items_owner_idx" ON "development_plan_items" USING btree ("owner_person_id");--> statement-breakpoint
CREATE INDEX "development_plans_person_idx" ON "development_plans" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "development_plans_assessment_uq" ON "development_plans" USING btree ("assessment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grades_organization_rank_uq" ON "grades" USING btree ("organization_id","rank");--> statement-breakpoint
CREATE UNIQUE INDEX "grades_organization_name_uq" ON "grades" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "matrices_role_profile_idx" ON "matrices" USING btree ("role_profile_id");--> statement-breakpoint
CREATE INDEX "matrix_requirements_competency_idx" ON "matrix_requirements" USING btree ("competency_id");--> statement-breakpoint
CREATE INDEX "matrix_requirements_task_link_idx" ON "matrix_requirements" USING btree ("task_competency_link_id");--> statement-breakpoint
CREATE UNIQUE INDEX "matrix_requirements_revision_competency_uq" ON "matrix_requirements" USING btree ("matrix_revision_id","competency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "matrix_revisions_matrix_version_uq" ON "matrix_revisions" USING btree ("matrix_id","version");--> statement-breakpoint
CREATE INDEX "org_units_organization_idx" ON "org_units" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_units_parent_idx" ON "org_units" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "people_email_uq" ON "people" USING btree ("email");--> statement-breakpoint
CREATE INDEX "people_organization_idx" ON "people" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_families_organization_name_uq" ON "role_families" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "role_profiles_role_grade_uq" ON "role_profiles" USING btree ("role_id","grade_id");--> statement-breakpoint
CREATE INDEX "role_tasks_role_profile_idx" ON "role_tasks" USING btree ("role_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_family_name_uq" ON "roles" USING btree ("role_family_id","name");--> statement-breakpoint
CREATE INDEX "task_competency_links_role_task_idx" ON "task_competency_links" USING btree ("role_task_id");--> statement-breakpoint
CREATE INDEX "task_competency_links_competency_idx" ON "task_competency_links" USING btree ("competency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_competency_links_task_competency_uq" ON "task_competency_links" USING btree ("role_task_id","competency_id");