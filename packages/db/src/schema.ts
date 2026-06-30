import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

export const skillCatalogNodeKind = pgEnum('skill_catalog_node_kind', ['FOLDER', 'SKILL']);
export const appPermission = pgEnum('app_permission', [
  'MANAGE_CATALOG',
  'MANAGE_MATRICES',
  'MANAGE_ORG',
  'ASSIGN_MATRICES',
  'MANAGE_USERS_ROLES',
  'VIEW_ALL_ASSESSMENTS',
]);
export const assessmentKind = pgEnum('assessment_kind', ['SELF', 'MANAGER']);

function createdUpdatedColumns() {
  return {
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  };
}

export const grades = pgTable(
  'grades',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    sortOrder: integer('sort_order').notNull(),
    createdByUserId: text('created_by_user_id').notNull(),
    ...createdUpdatedColumns(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('grades_name_unique').on(table.name),
    index('grades_sort_order_idx').on(table.sortOrder),
    check('grades_sort_order_positive', sql`${table.sortOrder} > 0`),
  ],
);

export const skills = pgTable(
  'skills',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    scaleMin: integer('scale_min').notNull(),
    scaleMax: integer('scale_max').notNull(),
    scaleStep: integer('scale_step').notNull(),
    createdByUserId: text('created_by_user_id').notNull(),
    ...createdUpdatedColumns(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('skills_name_unique').on(table.name),
    check('skills_scale_range', sql`${table.scaleMin} < ${table.scaleMax}`),
    check('skills_scale_step_positive', sql`${table.scaleStep} > 0`),
  ],
);

export const skillScaleMarks = pgTable(
  'skill_scale_marks',
  {
    id: text('id').primaryKey(),
    skillId: text('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
    value: integer('value').notNull(),
    label: text('label').notNull(),
    description: text('description').notNull().default(''),
    sortOrder: integer('sort_order').notNull(),
  },
  (table) => [
    uniqueIndex('skill_scale_marks_skill_value_unique').on(table.skillId, table.value),
    uniqueIndex('skill_scale_marks_skill_label_unique').on(table.skillId, table.label),
    index('skill_scale_marks_skill_sort_idx').on(table.skillId, table.sortOrder),
    check('skill_scale_marks_sort_order_positive', sql`${table.sortOrder} > 0`),
  ],
);

export const skillCatalogNodes = pgTable(
  'skill_catalog_nodes',
  {
    id: text('id').primaryKey(),
    parentId: text('parent_id').references((): AnyPgColumn => skillCatalogNodes.id, { onDelete: 'set null' }),
    kind: skillCatalogNodeKind('kind').notNull(),
    folderName: text('folder_name'),
    skillId: text('skill_id').references(() => skills.id, { onDelete: 'restrict' }),
    sortOrder: integer('sort_order').notNull(),
    createdByUserId: text('created_by_user_id').notNull(),
    ...createdUpdatedColumns(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('skill_catalog_nodes_skill_unique').on(table.skillId),
    index('skill_catalog_nodes_parent_sort_idx').on(table.parentId, table.sortOrder),
    check(
      'skill_catalog_nodes_kind_shape',
      sql`(
        (${table.kind} = 'FOLDER' and ${table.folderName} is not null and ${table.skillId} is null)
        or (${table.kind} = 'SKILL' and ${table.skillId} is not null and ${table.folderName} is null)
      )`,
    ),
    check('skill_catalog_nodes_sort_order_positive', sql`${table.sortOrder} > 0`),
  ],
);

export const competencyRoles = pgTable(
  'competency_roles',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    createdByUserId: text('created_by_user_id').notNull(),
    ...createdUpdatedColumns(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('competency_roles_name_unique').on(table.name)],
);

export const competencyRoleSkills = pgTable(
  'competency_role_skills',
  {
    id: text('id').primaryKey(),
    roleId: text('role_id')
      .notNull()
      .references(() => competencyRoles.id, { onDelete: 'cascade' }),
    skillId: text('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'restrict' }),
    sortOrder: integer('sort_order').notNull(),
    isRequired: boolean('is_required').notNull().default(true),
    createdByUserId: text('created_by_user_id').notNull(),
    ...createdUpdatedColumns(),
  },
  (table) => [
    uniqueIndex('competency_role_skills_role_skill_unique').on(table.roleId, table.skillId),
    index('competency_role_skills_role_sort_idx').on(table.roleId, table.sortOrder),
    check('competency_role_skills_sort_order_positive', sql`${table.sortOrder} > 0`),
  ],
);

export const roleSkillGradeTargets = pgTable(
  'role_skill_grade_targets',
  {
    id: text('id').primaryKey(),
    roleSkillId: text('role_skill_id')
      .notNull()
      .references(() => competencyRoleSkills.id, { onDelete: 'cascade' }),
    gradeId: text('grade_id')
      .notNull()
      .references(() => grades.id, { onDelete: 'restrict' }),
    targetValue: integer('target_value').notNull(),
    createdByUserId: text('created_by_user_id').notNull(),
    ...createdUpdatedColumns(),
  },
  (table) => [
    uniqueIndex('role_skill_grade_targets_role_skill_grade_unique').on(table.roleSkillId, table.gradeId),
    index('role_skill_grade_targets_grade_idx').on(table.gradeId),
  ],
);

// --- Access control, org tree, assignments, assessments ---

export const appRoles = pgTable(
  'app_roles',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    isSystem: boolean('is_system').notNull().default(false),
    createdByUserId: text('created_by_user_id').notNull(),
    ...createdUpdatedColumns(),
  },
  (table) => [uniqueIndex('app_roles_name_unique').on(table.name)],
);

export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: text('role_id')
      .notNull()
      .references(() => appRoles.id, { onDelete: 'cascade' }),
    permission: appPermission('permission').notNull(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permission] })],
);

export const employees = pgTable(
  'employees',
  {
    id: text('id').primaryKey(),
    fullName: text('full_name').notNull(),
    title: text('title').notNull().default(''),
    managerId: text('manager_id').references((): AnyPgColumn => employees.id, { onDelete: 'set null' }),
    createdByUserId: text('created_by_user_id').notNull(),
    ...createdUpdatedColumns(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [index('employees_manager_idx').on(table.managerId)],
);

export const appUsers = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name').notNull(),
    roleId: text('role_id')
      .notNull()
      .references(() => appRoles.id, { onDelete: 'restrict' }),
    employeeId: text('employee_id').references(() => employees.id, { onDelete: 'set null' }),
    ...createdUpdatedColumns(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    uniqueIndex('users_employee_unique').on(table.employeeId),
  ],
);

export const matrixAssignments = pgTable(
  'matrix_assignments',
  {
    id: text('id').primaryKey(),
    employeeId: text('employee_id')
      .notNull()
      .references(() => employees.id, { onDelete: 'cascade' }),
    roleId: text('role_id')
      .notNull()
      .references(() => competencyRoles.id, { onDelete: 'cascade' }),
    gradeId: text('grade_id')
      .notNull()
      .references(() => grades.id, { onDelete: 'restrict' }),
    createdByUserId: text('created_by_user_id').notNull(),
    ...createdUpdatedColumns(),
  },
  (table) => [
    uniqueIndex('matrix_assignments_employee_role_unique').on(table.employeeId, table.roleId),
    index('matrix_assignments_employee_idx').on(table.employeeId),
  ],
);

export const assessments = pgTable(
  'assessments',
  {
    id: text('id').primaryKey(),
    assignmentId: text('assignment_id')
      .notNull()
      .references(() => matrixAssignments.id, { onDelete: 'cascade' }),
    skillId: text('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
    assessorUserId: text('assessor_user_id')
      .notNull()
      .references(() => appUsers.id, { onDelete: 'cascade' }),
    kind: assessmentKind('kind').notNull(),
    value: integer('value').notNull(),
    ...createdUpdatedColumns(),
  },
  (table) => [
    uniqueIndex('assessments_unique').on(table.assignmentId, table.skillId, table.assessorUserId),
    index('assessments_assignment_idx').on(table.assignmentId),
  ],
);

export const appRolesRelations = relations(appRoles, ({ many }) => ({
  permissions: many(rolePermissions),
  users: many(appUsers),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(appRoles, { fields: [rolePermissions.roleId], references: [appRoles.id] }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: 'org_tree',
  }),
  reports: many(employees, { relationName: 'org_tree' }),
  user: one(appUsers, { fields: [employees.id], references: [appUsers.employeeId] }),
  assignments: many(matrixAssignments),
}));

export const appUsersRelations = relations(appUsers, ({ one }) => ({
  role: one(appRoles, { fields: [appUsers.roleId], references: [appRoles.id] }),
  employee: one(employees, { fields: [appUsers.employeeId], references: [employees.id] }),
}));

export const matrixAssignmentsRelations = relations(matrixAssignments, ({ one, many }) => ({
  employee: one(employees, { fields: [matrixAssignments.employeeId], references: [employees.id] }),
  role: one(competencyRoles, { fields: [matrixAssignments.roleId], references: [competencyRoles.id] }),
  grade: one(grades, { fields: [matrixAssignments.gradeId], references: [grades.id] }),
  assessments: many(assessments),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  assignment: one(matrixAssignments, { fields: [assessments.assignmentId], references: [matrixAssignments.id] }),
  skill: one(skills, { fields: [assessments.skillId], references: [skills.id] }),
  assessor: one(appUsers, { fields: [assessments.assessorUserId], references: [appUsers.id] }),
}));

export const gradesRelations = relations(grades, ({ many }) => ({
  roleSkillTargets: many(roleSkillGradeTargets),
}));

export const skillsRelations = relations(skills, ({ many, one }) => ({
  marks: many(skillScaleMarks),
  catalogNode: one(skillCatalogNodes, {
    fields: [skills.id],
    references: [skillCatalogNodes.skillId],
  }),
  roleSkills: many(competencyRoleSkills),
}));

export const skillScaleMarksRelations = relations(skillScaleMarks, ({ one }) => ({
  skill: one(skills, {
    fields: [skillScaleMarks.skillId],
    references: [skills.id],
  }),
}));

export const skillCatalogNodesRelations = relations(skillCatalogNodes, ({ many, one }) => ({
  parent: one(skillCatalogNodes, {
    fields: [skillCatalogNodes.parentId],
    references: [skillCatalogNodes.id],
    relationName: 'catalog_tree',
  }),
  children: many(skillCatalogNodes, {
    relationName: 'catalog_tree',
  }),
  skill: one(skills, {
    fields: [skillCatalogNodes.skillId],
    references: [skills.id],
  }),
}));

export const competencyRolesRelations = relations(competencyRoles, ({ many }) => ({
  skills: many(competencyRoleSkills),
}));

export const competencyRoleSkillsRelations = relations(competencyRoleSkills, ({ many, one }) => ({
  role: one(competencyRoles, {
    fields: [competencyRoleSkills.roleId],
    references: [competencyRoles.id],
  }),
  skill: one(skills, {
    fields: [competencyRoleSkills.skillId],
    references: [skills.id],
  }),
  gradeTargets: many(roleSkillGradeTargets),
}));

export const roleSkillGradeTargetsRelations = relations(roleSkillGradeTargets, ({ one }) => ({
  roleSkill: one(competencyRoleSkills, {
    fields: [roleSkillGradeTargets.roleSkillId],
    references: [competencyRoleSkills.id],
  }),
  grade: one(grades, {
    fields: [roleSkillGradeTargets.gradeId],
    references: [grades.id],
  }),
}));
