CREATE TYPE "public"."skill_catalog_node_kind" AS ENUM('FOLDER', 'SKILL');--> statement-breakpoint
CREATE TABLE "competency_role_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"sort_order" integer NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competency_role_skills_sort_order_positive" CHECK ("competency_role_skills"."sort_order" > 0)
);
--> statement-breakpoint
CREATE TABLE "competency_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "grades_sort_order_positive" CHECK ("grades"."sort_order" > 0)
);
--> statement-breakpoint
CREATE TABLE "role_skill_grade_targets" (
	"id" text PRIMARY KEY NOT NULL,
	"role_skill_id" text NOT NULL,
	"grade_id" text NOT NULL,
	"target_value" integer NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_catalog_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"kind" "skill_catalog_node_kind" NOT NULL,
	"folder_name" text,
	"skill_id" text,
	"sort_order" integer NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "skill_catalog_nodes_kind_shape" CHECK ((
        ("skill_catalog_nodes"."kind" = 'FOLDER' and "skill_catalog_nodes"."folder_name" is not null and "skill_catalog_nodes"."skill_id" is null)
        or ("skill_catalog_nodes"."kind" = 'SKILL' and "skill_catalog_nodes"."skill_id" is not null and "skill_catalog_nodes"."folder_name" is null)
      )),
	CONSTRAINT "skill_catalog_nodes_sort_order_positive" CHECK ("skill_catalog_nodes"."sort_order" > 0)
);
--> statement-breakpoint
CREATE TABLE "skill_scale_marks" (
	"id" text PRIMARY KEY NOT NULL,
	"skill_id" text NOT NULL,
	"value" integer NOT NULL,
	"label" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "skill_scale_marks_sort_order_positive" CHECK ("skill_scale_marks"."sort_order" > 0)
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"scale_min" integer NOT NULL,
	"scale_max" integer NOT NULL,
	"scale_step" integer NOT NULL,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "skills_scale_range" CHECK ("skills"."scale_min" < "skills"."scale_max"),
	CONSTRAINT "skills_scale_step_positive" CHECK ("skills"."scale_step" > 0)
);
--> statement-breakpoint
ALTER TABLE "competency_role_skills" ADD CONSTRAINT "competency_role_skills_role_id_competency_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."competency_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competency_role_skills" ADD CONSTRAINT "competency_role_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_skill_grade_targets" ADD CONSTRAINT "role_skill_grade_targets_role_skill_id_competency_role_skills_id_fk" FOREIGN KEY ("role_skill_id") REFERENCES "public"."competency_role_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_skill_grade_targets" ADD CONSTRAINT "role_skill_grade_targets_grade_id_grades_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grades"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_catalog_nodes" ADD CONSTRAINT "skill_catalog_nodes_parent_id_skill_catalog_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."skill_catalog_nodes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_catalog_nodes" ADD CONSTRAINT "skill_catalog_nodes_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_scale_marks" ADD CONSTRAINT "skill_scale_marks_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "competency_role_skills_role_skill_unique" ON "competency_role_skills" USING btree ("role_id","skill_id");--> statement-breakpoint
CREATE INDEX "competency_role_skills_role_sort_idx" ON "competency_role_skills" USING btree ("role_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "competency_roles_name_unique" ON "competency_roles" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "grades_name_unique" ON "grades" USING btree ("name");--> statement-breakpoint
CREATE INDEX "grades_sort_order_idx" ON "grades" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "role_skill_grade_targets_role_skill_grade_unique" ON "role_skill_grade_targets" USING btree ("role_skill_id","grade_id");--> statement-breakpoint
CREATE INDEX "role_skill_grade_targets_grade_idx" ON "role_skill_grade_targets" USING btree ("grade_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_catalog_nodes_skill_unique" ON "skill_catalog_nodes" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "skill_catalog_nodes_parent_sort_idx" ON "skill_catalog_nodes" USING btree ("parent_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_scale_marks_skill_value_unique" ON "skill_scale_marks" USING btree ("skill_id","value");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_scale_marks_skill_label_unique" ON "skill_scale_marks" USING btree ("skill_id","label");--> statement-breakpoint
CREATE INDEX "skill_scale_marks_skill_sort_idx" ON "skill_scale_marks" USING btree ("skill_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_name_unique" ON "skills" USING btree ("name");