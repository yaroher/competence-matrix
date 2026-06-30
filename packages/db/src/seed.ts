import 'dotenv/config';
import {
  appRoles,
  appUsers,
  competencyRoles,
  competencyRoleSkills,
  createDb,
  createPool,
  employees,
  grades,
  matrixAssignments,
  rolePermissions,
  roleSkillGradeTargets,
  skillCatalogNodes,
  skills,
  skillScaleMarks,
} from './index.js';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const systemUserId = 'user-system';

async function main() {
  const pool = createPool();
  const db = createDb(pool);

  try {
    await db
      .insert(grades)
      .values([
        { id: 'grade-junior', name: 'Junior', sortOrder: 1, createdByUserId: systemUserId },
        { id: 'grade-middle', name: 'Middle', sortOrder: 2, createdByUserId: systemUserId },
        { id: 'grade-senior', name: 'Senior', sortOrder: 3, createdByUserId: systemUserId },
      ])
      .onConflictDoUpdate({
        target: grades.id,
        set: { updatedAt: new Date() },
      });

    await db
      .insert(skills)
      .values([
        {
          id: 'skill-go-basics',
          name: 'Go basics',
          description: 'Syntax, packages, interfaces, errors',
          scaleMin: 0,
          scaleMax: 5,
          scaleStep: 1,
          createdByUserId: systemUserId,
        },
        {
          id: 'skill-go-concurrency',
          name: 'Go concurrency',
          description: 'Goroutines, channels, context cancellation',
          scaleMin: 0,
          scaleMax: 5,
          scaleStep: 1,
          createdByUserId: systemUserId,
        },
        {
          id: 'skill-http-apis',
          name: 'HTTP APIs',
          description: 'HTTP handlers, middleware, status codes, API contracts',
          scaleMin: 0,
          scaleMax: 5,
          scaleStep: 1,
          createdByUserId: systemUserId,
        },
      ])
      .onConflictDoUpdate({
        target: skills.id,
        set: { updatedAt: new Date() },
      });

    await db
      .insert(skillScaleMarks)
      .values([
        { id: 'mark-go-basics-0', skillId: 'skill-go-basics', value: 0, label: 'No practice', sortOrder: 1 },
        { id: 'mark-go-basics-3', skillId: 'skill-go-basics', value: 3, label: 'Production tasks', sortOrder: 2 },
        { id: 'mark-go-basics-5', skillId: 'skill-go-basics', value: 5, label: 'Design owner', sortOrder: 3 },
        {
          id: 'mark-go-concurrency-0',
          skillId: 'skill-go-concurrency',
          value: 0,
          label: 'No practice',
          sortOrder: 1,
        },
        {
          id: 'mark-go-concurrency-3',
          skillId: 'skill-go-concurrency',
          value: 3,
          label: 'Uses safely',
          sortOrder: 2,
        },
        {
          id: 'mark-go-concurrency-5',
          skillId: 'skill-go-concurrency',
          value: 5,
          label: 'Designs systems',
          sortOrder: 3,
        },
        { id: 'mark-http-apis-0', skillId: 'skill-http-apis', value: 0, label: 'No practice', sortOrder: 1 },
        { id: 'mark-http-apis-3', skillId: 'skill-http-apis', value: 3, label: 'Builds endpoints', sortOrder: 2 },
        { id: 'mark-http-apis-5', skillId: 'skill-http-apis', value: 5, label: 'Owns API design', sortOrder: 3 },
      ])
      .onConflictDoNothing();

    await db
      .insert(skillCatalogNodes)
      .values([
        {
          id: 'node-backend',
          kind: 'FOLDER',
          folderName: 'Backend',
          sortOrder: 1,
          createdByUserId: systemUserId,
        },
        {
          id: 'node-go',
          parentId: 'node-backend',
          kind: 'FOLDER',
          folderName: 'Go',
          sortOrder: 1,
          createdByUserId: systemUserId,
        },
        {
          id: 'node-go-basics',
          parentId: 'node-go',
          kind: 'SKILL',
          skillId: 'skill-go-basics',
          sortOrder: 1,
          createdByUserId: systemUserId,
        },
        {
          id: 'node-go-concurrency',
          parentId: 'node-go',
          kind: 'SKILL',
          skillId: 'skill-go-concurrency',
          sortOrder: 2,
          createdByUserId: systemUserId,
        },
        {
          id: 'node-http-apis',
          parentId: 'node-backend',
          kind: 'SKILL',
          skillId: 'skill-http-apis',
          sortOrder: 2,
          createdByUserId: systemUserId,
        },
      ])
      .onConflictDoUpdate({
        target: skillCatalogNodes.id,
        set: { updatedAt: new Date() },
      });

    await db
      .insert(competencyRoles)
      .values([
        {
          id: 'role-go-developer',
          name: 'Go developer',
          description: 'Backend engineer focused on Go services',
          createdByUserId: systemUserId,
        },
        {
          id: 'role-go-team-lead',
          name: 'Go team lead',
          description: 'Technical lead for Go backend teams',
          createdByUserId: systemUserId,
        },
      ])
      .onConflictDoUpdate({
        target: competencyRoles.id,
        set: { updatedAt: new Date() },
      });

    await db
      .insert(competencyRoleSkills)
      .values([
        {
          id: 'role-skill-go-developer-go-basics',
          roleId: 'role-go-developer',
          skillId: 'skill-go-basics',
          sortOrder: 1,
          createdByUserId: systemUserId,
        },
        {
          id: 'role-skill-go-developer-go-concurrency',
          roleId: 'role-go-developer',
          skillId: 'skill-go-concurrency',
          sortOrder: 2,
          createdByUserId: systemUserId,
        },
        {
          id: 'role-skill-go-developer-http-apis',
          roleId: 'role-go-developer',
          skillId: 'skill-http-apis',
          sortOrder: 3,
          createdByUserId: systemUserId,
        },
        {
          id: 'role-skill-go-team-lead-go-basics',
          roleId: 'role-go-team-lead',
          skillId: 'skill-go-basics',
          sortOrder: 1,
          createdByUserId: systemUserId,
        },
        {
          id: 'role-skill-go-team-lead-go-concurrency',
          roleId: 'role-go-team-lead',
          skillId: 'skill-go-concurrency',
          sortOrder: 2,
          createdByUserId: systemUserId,
        },
        {
          id: 'role-skill-go-team-lead-http-apis',
          roleId: 'role-go-team-lead',
          skillId: 'skill-http-apis',
          sortOrder: 3,
          createdByUserId: systemUserId,
        },
      ])
      .onConflictDoUpdate({
        target: competencyRoleSkills.id,
        set: { updatedAt: new Date() },
      });

    await db
      .insert(roleSkillGradeTargets)
      .values([
        {
          id: 'target-role-skill-go-developer-go-concurrency-grade-middle',
          roleSkillId: 'role-skill-go-developer-go-concurrency',
          gradeId: 'grade-middle',
          targetValue: 3,
          createdByUserId: systemUserId,
        },
        {
          id: 'target-role-skill-go-team-lead-go-concurrency-grade-middle',
          roleSkillId: 'role-skill-go-team-lead-go-concurrency',
          gradeId: 'grade-middle',
          targetValue: 5,
          createdByUserId: systemUserId,
        },
        {
          id: 'target-role-skill-go-developer-http-apis-grade-middle',
          roleSkillId: 'role-skill-go-developer-http-apis',
          gradeId: 'grade-middle',
          targetValue: 3,
          createdByUserId: systemUserId,
        },
        {
          id: 'target-role-skill-go-team-lead-http-apis-grade-middle',
          roleSkillId: 'role-skill-go-team-lead-http-apis',
          gradeId: 'grade-middle',
          targetValue: 4,
          createdByUserId: systemUserId,
        },
      ])
      .onConflictDoUpdate({
        target: [roleSkillGradeTargets.roleSkillId, roleSkillGradeTargets.gradeId],
        set: { targetValue: sql`excluded.target_value`, updatedAt: new Date() },
      });

    // --- access control roles + permissions ---
    await db
      .insert(appRoles)
      .values([
        { id: 'role-admin', name: 'Администратор', isSystem: true, createdByUserId: systemUserId },
        { id: 'role-hr', name: 'HR', isSystem: true, createdByUserId: systemUserId },
        { id: 'role-member', name: 'Сотрудник', isSystem: true, createdByUserId: systemUserId },
      ])
      .onConflictDoUpdate({ target: appRoles.id, set: { updatedAt: new Date() } });

    await db
      .insert(rolePermissions)
      .values([
        { roleId: 'role-admin', permission: 'MANAGE_CATALOG' },
        { roleId: 'role-admin', permission: 'MANAGE_MATRICES' },
        { roleId: 'role-admin', permission: 'MANAGE_ORG' },
        { roleId: 'role-admin', permission: 'ASSIGN_MATRICES' },
        { roleId: 'role-admin', permission: 'MANAGE_USERS_ROLES' },
        { roleId: 'role-admin', permission: 'VIEW_ALL_ASSESSMENTS' },
        { roleId: 'role-hr', permission: 'VIEW_ALL_ASSESSMENTS' },
        { roleId: 'role-hr', permission: 'ASSIGN_MATRICES' },
        { roleId: 'role-hr', permission: 'MANAGE_ORG' },
      ])
      .onConflictDoNothing();

    // --- demo org tree (strict tree, single manager) ---
    await db
      .insert(employees)
      .values([
        { id: 'emp-cto', fullName: 'Анна Демидова', title: 'CTO', managerId: null, createdByUserId: systemUserId },
        { id: 'emp-lead', fullName: 'Борис Кравцов', title: 'Тимлид', managerId: 'emp-cto', createdByUserId: systemUserId },
        { id: 'emp-dev1', fullName: 'Виктор Лосев', title: 'Backend-разработчик', managerId: 'emp-lead', createdByUserId: systemUserId },
        { id: 'emp-dev2', fullName: 'Галина Орлова', title: 'Frontend-разработчица', managerId: 'emp-lead', createdByUserId: systemUserId },
      ])
      .onConflictDoUpdate({ target: employees.id, set: { updatedAt: new Date() } });

    const passwordHash = bcrypt.hashSync('password', 10);
    await db
      .insert(appUsers)
      .values([
        { id: 'user-admin', email: 'admin@comatrix.dev', passwordHash, displayName: 'Администратор', roleId: 'role-admin', employeeId: null },
        { id: 'user-hr', email: 'hr@comatrix.dev', passwordHash, displayName: 'HR-менеджер', roleId: 'role-hr', employeeId: null },
        { id: 'user-cto', email: 'cto@comatrix.dev', passwordHash, displayName: 'Анна Демидова', roleId: 'role-member', employeeId: 'emp-cto' },
        { id: 'user-lead', email: 'lead@comatrix.dev', passwordHash, displayName: 'Борис Кравцов', roleId: 'role-member', employeeId: 'emp-lead' },
        { id: 'user-dev1', email: 'dev1@comatrix.dev', passwordHash, displayName: 'Виктор Лосев', roleId: 'role-member', employeeId: 'emp-dev1' },
        { id: 'user-dev2', email: 'dev2@comatrix.dev', passwordHash, displayName: 'Галина Орлова', roleId: 'role-member', employeeId: 'emp-dev2' },
      ])
      .onConflictDoUpdate({ target: appUsers.id, set: { updatedAt: new Date() } });

    // --- demo assignment: Виктор → Go developer @ Middle ---
    await db
      .insert(matrixAssignments)
      .values([
        { id: 'assign-dev1-go', employeeId: 'emp-dev1', roleId: 'role-go-developer', gradeId: 'grade-middle', createdByUserId: systemUserId },
      ])
      .onConflictDoUpdate({ target: [matrixAssignments.employeeId, matrixAssignments.roleId], set: { updatedAt: new Date() } });

    console.log('Seeded catalog, roles/permissions, org tree, users, assignment.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
