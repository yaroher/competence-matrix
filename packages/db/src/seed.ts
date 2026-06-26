import 'dotenv/config';
import {
  competencyRoles,
  competencyRoleSkills,
  createDb,
  createPool,
  grades,
  roleSkillGradeTargets,
  skillCatalogNodes,
  skills,
  skillScaleMarks,
} from './index.js';
import { sql } from 'drizzle-orm';

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

    console.log('Seeded skill catalog and competency roles.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
