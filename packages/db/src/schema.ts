import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const sourceKind = pgEnum('source_kind', [
  'system_seed',
  'organization_custom',
  'imported',
  'external_mapping',
]);

export const validationStatus = pgEnum('validation_status', ['draft', 'reviewed', 'validated']);
export const assessmentSource = pgEnum('assessment_source', ['self', 'manager', 'expert', 'final']);
export const criticality = pgEnum('criticality', ['low', 'medium', 'high']);

export const organizationStatus = pgEnum('organization_status', ['active', 'archived']);
export const orgUnitType = pgEnum('org_unit_type', ['company', 'department', 'team']);
export const orgUnitStatus = pgEnum('org_unit_status', ['active', 'archived']);

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: organizationStatus('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orgUnits = pgTable('org_units', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  parentId: text('parent_id'),
  type: orgUnitType('type').notNull(),
  name: text('name').notNull(),
  status: orgUnitStatus('status').notNull().default('active'),
}, (table) => [
  index('org_units_organization_idx').on(table.organizationId),
  index('org_units_parent_idx').on(table.parentId),
  uniqueIndex('org_units_organization_parent_name_uq').on(table.organizationId, table.parentId, table.name),
  check('org_units_no_self_parent', sql`${table.parentId} IS NULL OR ${table.parentId} <> ${table.id}`),
]);

export const people = pgTable('people', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  status: text('status').notNull().default('active'),
}, (table) => [
  uniqueIndex('people_email_uq').on(table.email),
  index('people_organization_idx').on(table.organizationId),
]);

export const roleFamilies = pgTable('role_families', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
}, (table) => [
  uniqueIndex('role_families_organization_name_uq').on(table.organizationId, table.name),
]);

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  roleFamilyId: text('role_family_id').notNull().references(() => roleFamilies.id),
  name: text('name').notNull(),
}, (table) => [
  uniqueIndex('roles_family_name_uq').on(table.roleFamilyId, table.name),
]);

export const grades = pgTable('grades', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  rank: integer('rank').notNull(),
}, (table) => [
  uniqueIndex('grades_organization_rank_uq').on(table.organizationId, table.rank),
  uniqueIndex('grades_organization_name_uq').on(table.organizationId, table.name),
]);

export const roleProfiles = pgTable('role_profiles', {
  id: text('id').primaryKey(),
  roleId: text('role_id').notNull().references(() => roles.id),
  gradeId: text('grade_id').notNull().references(() => grades.id),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
}, (table) => [
  uniqueIndex('role_profiles_role_grade_uq').on(table.roleId, table.gradeId),
]);

export const levelDefinitions = pgTable('level_definitions', {
  value: integer('value').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
});

export const assignments = pgTable('assignments', {
  id: text('id').primaryKey(),
  personId: text('person_id').notNull().references(() => people.id),
  orgUnitId: text('org_unit_id').notNull().references(() => orgUnits.id),
  managerPersonId: text('manager_person_id').references(() => people.id),
  roleProfileId: text('role_profile_id').notNull().references(() => roleProfiles.id),
  effectiveFrom: timestamp('effective_from', { withTimezone: true }).notNull(),
  effectiveTo: timestamp('effective_to', { withTimezone: true }),
}, (table) => [
  index('assignments_person_idx').on(table.personId),
  index('assignments_org_unit_idx').on(table.orgUnitId),
  index('assignments_manager_idx').on(table.managerPersonId),
  index('assignments_role_profile_idx').on(table.roleProfileId),
]);

export const roleTasks = pgTable('role_tasks', {
  id: text('id').primaryKey(),
  roleProfileId: text('role_profile_id').notNull().references(() => roleProfiles.id),
  name: text('name').notNull(),
  expectedOutcome: text('expected_outcome').notNull(),
  criticality: criticality('criticality').notNull(),
}, (table) => [
  index('role_tasks_role_profile_idx').on(table.roleProfileId),
]);

export const competencyCategories = pgTable('competency_categories', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  parentId: text('parent_id'),
  categoryType: text('category_type').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  sourceKind: sourceKind('source_kind').notNull(),
  sourceRef: text('source_ref'),
  templateNodeId: text('template_node_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  status: text('status').notNull().default('active'),
}, (table) => [
  index('competency_categories_organization_idx').on(table.organizationId),
  index('competency_categories_parent_idx').on(table.parentId),
  uniqueIndex('competency_categories_organization_name_uq').on(table.organizationId, table.name),
]);

export const competencies = pgTable('competencies', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  categoryId: text('category_id').notNull().references(() => competencyCategories.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  sourceKind: sourceKind('source_kind').notNull(),
  sourceRef: text('source_ref'),
  templateCompetencyId: text('template_competency_id'),
  validationStatus: validationStatus('validation_status').notNull().default('draft'),
  tags: jsonb('tags').notNull().default([]),
  behavioralIndicators: jsonb('behavioral_indicators').notNull().default([]),
}, (table) => [
  index('competencies_organization_idx').on(table.organizationId),
  index('competencies_category_idx').on(table.categoryId),
  uniqueIndex('competencies_organization_code_uq').on(table.organizationId, table.code),
]);

export const competencyRelations = pgTable('competency_relations', {
  id: text('id').primaryKey(),
  sourceCompetencyId: text('source_competency_id').notNull().references(() => competencies.id),
  targetCompetencyId: text('target_competency_id').notNull().references(() => competencies.id),
  relationType: text('relation_type').notNull(),
  strength: numeric('strength', { precision: 3, scale: 2 }).notNull(),
}, (table) => [
  index('competency_relations_source_idx').on(table.sourceCompetencyId),
  index('competency_relations_target_idx').on(table.targetCompetencyId),
  uniqueIndex('competency_relations_edge_uq').on(table.sourceCompetencyId, table.targetCompetencyId, table.relationType),
]);

export const taskCompetencyLinks = pgTable('task_competency_links', {
  id: text('id').primaryKey(),
  roleTaskId: text('role_task_id').notNull().references(() => roleTasks.id),
  competencyId: text('competency_id').notNull().references(() => competencies.id),
  criticality: criticality('criticality').notNull(),
  neededOnEntry: boolean('needed_on_entry').notNull().default(false),
}, (table) => [
  index('task_competency_links_role_task_idx').on(table.roleTaskId),
  index('task_competency_links_competency_idx').on(table.competencyId),
  uniqueIndex('task_competency_links_task_competency_uq').on(table.roleTaskId, table.competencyId),
]);

export const matrices = pgTable('matrices', {
  id: text('id').primaryKey(),
  roleProfileId: text('role_profile_id').notNull().references(() => roleProfiles.id),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'),
  activeRevisionId: text('active_revision_id'),
}, (table) => [
  index('matrices_role_profile_idx').on(table.roleProfileId),
]);

export const matrixRevisions = pgTable('matrix_revisions', {
  id: text('id').primaryKey(),
  matrixId: text('matrix_id').notNull().references(() => matrices.id),
  version: integer('version').notNull(),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('matrix_revisions_matrix_version_uq').on(table.matrixId, table.version),
]);

export const matrixRequirements = pgTable('matrix_requirements', {
  id: text('id').primaryKey(),
  matrixRevisionId: text('matrix_revision_id').notNull().references(() => matrixRevisions.id),
  competencyId: text('competency_id').notNull().references(() => competencies.id),
  targetLevel: integer('target_level').notNull(),
  required: boolean('required').notNull().default(true),
  normalizedWeight: numeric('normalized_weight', { precision: 5, scale: 4 }).notNull(),
  weightSource: text('weight_source').notNull(),
  criticality: criticality('criticality').notNull(),
  neededOnEntry: boolean('needed_on_entry').notNull().default(false),
  taskCompetencyLinkId: text('task_competency_link_id').references(() => taskCompetencyLinks.id),
}, (table) => [
  index('matrix_requirements_competency_idx').on(table.competencyId),
  index('matrix_requirements_task_link_idx').on(table.taskCompetencyLinkId),
  uniqueIndex('matrix_requirements_revision_competency_uq').on(table.matrixRevisionId, table.competencyId),
]);

export const assessments = pgTable('assessments', {
  id: text('id').primaryKey(),
  personId: text('person_id').notNull().references(() => people.id),
  roleProfileId: text('role_profile_id').notNull().references(() => roleProfiles.id),
  matrixRevisionId: text('matrix_revision_id').notNull().references(() => matrixRevisions.id),
  status: text('status').notNull().default('draft'),
}, (table) => [
  index('assessments_person_idx').on(table.personId),
  index('assessments_role_profile_idx').on(table.roleProfileId),
  uniqueIndex('assessments_person_revision_uq').on(table.personId, table.matrixRevisionId),
]);

export const assessmentScores = pgTable('assessment_scores', {
  id: text('id').primaryKey(),
  assessmentId: text('assessment_id').notNull().references(() => assessments.id),
  competencyId: text('competency_id').notNull().references(() => competencies.id),
  source: assessmentSource('source').notNull(),
  level: integer('level').notNull(),
  confidence: numeric('confidence', { precision: 3, scale: 2 }).notNull(),
  verificationStatus: text('verification_status').notNull(),
  comment: text('comment').notNull().default(''),
}, (table) => [
  index('assessment_scores_competency_idx').on(table.competencyId),
  uniqueIndex('assessment_scores_assessment_competency_source_uq').on(table.assessmentId, table.competencyId, table.source),
]);

export const developmentPlans = pgTable('development_plans', {
  id: text('id').primaryKey(),
  personId: text('person_id').notNull().references(() => people.id),
  assessmentId: text('assessment_id').notNull().references(() => assessments.id),
}, (table) => [
  index('development_plans_person_idx').on(table.personId),
  uniqueIndex('development_plans_assessment_uq').on(table.assessmentId),
]);

export const developmentPlanItems = pgTable('development_plan_items', {
  id: text('id').primaryKey(),
  developmentPlanId: text('development_plan_id').notNull().references(() => developmentPlans.id),
  competencyId: text('competency_id').notNull().references(() => competencies.id),
  gap: integer('gap').notNull(),
  title: text('title').notNull(),
  ownerPersonId: text('owner_person_id').notNull().references(() => people.id),
  status: text('status').notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
}, (table) => [
  index('development_plan_items_plan_idx').on(table.developmentPlanId),
  index('development_plan_items_competency_idx').on(table.competencyId),
  index('development_plan_items_owner_idx').on(table.ownerPersonId),
]);
