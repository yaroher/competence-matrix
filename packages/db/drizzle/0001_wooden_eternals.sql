CREATE TYPE "public"."app_permission" AS ENUM('MANAGE_CATALOG', 'MANAGE_MATRICES', 'MANAGE_ORG', 'ASSIGN_MATRICES', 'MANAGE_USERS_ROLES', 'VIEW_ALL_ASSESSMENTS');--> statement-breakpoint
CREATE TYPE "public"."assessment_kind" AS ENUM('SELF', 'MANAGER');--> statement-breakpoint
CREATE TABLE "app_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"role_id" text NOT NULL,
	"employee_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"assessor_user_id" text NOT NULL,
	"kind" "assessment_kind" NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"manager_id" text,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "matrix_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"role_id" text NOT NULL,
	"grade_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" text NOT NULL,
	"permission" "app_permission" NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_pk" PRIMARY KEY("role_id","permission")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_app_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."app_roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_assignment_id_matrix_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."matrix_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_assessor_user_id_users_id_fk" FOREIGN KEY ("assessor_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_assignments" ADD CONSTRAINT "matrix_assignments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_assignments" ADD CONSTRAINT "matrix_assignments_role_id_competency_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."competency_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_assignments" ADD CONSTRAINT "matrix_assignments_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_app_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."app_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "app_roles_name_unique" ON "app_roles" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_employee_unique" ON "users" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessments_unique" ON "assessments" USING btree ("assignment_id","skill_id","assessor_user_id");--> statement-breakpoint
CREATE INDEX "assessments_assignment_idx" ON "assessments" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "employees_manager_idx" ON "employees" USING btree ("manager_id");--> statement-breakpoint
CREATE UNIQUE INDEX "matrix_assignments_employee_role_unique" ON "matrix_assignments" USING btree ("employee_id","role_id");--> statement-breakpoint
CREATE INDEX "matrix_assignments_employee_idx" ON "matrix_assignments" USING btree ("employee_id");