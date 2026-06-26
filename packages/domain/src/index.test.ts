import { describe, expect, it } from 'vitest';
import {
  assertRoleSkillGradeTarget,
  buildSkillCatalogTree,
  createEmptyCatalogState,
  type CatalogState,
} from './index.js';

const now = '2026-06-26T00:00:00.000Z';

function stateWithSharedSkill(): CatalogState {
  const state = createEmptyCatalogState();
  state.grades.push({ id: 'grade-middle', name: 'Middle', sortOrder: 20, createdByUserId: 'user-1', createdAt: now, updatedAt: now });
  state.skills.push({
    id: 'skill-go-concurrency',
    name: 'Go concurrency',
    description: '',
    scaleMin: 0,
    scaleMax: 100,
    scaleStep: 5,
    createdByUserId: 'user-1',
    createdAt: now,
    updatedAt: now,
  });
  state.competencyRoles.push(
    { id: 'role-go-dev', name: 'Go Developer', description: '', createdByUserId: 'user-1', createdAt: now, updatedAt: now },
    { id: 'role-platform-dev', name: 'Platform Developer', description: '', createdByUserId: 'user-1', createdAt: now, updatedAt: now },
  );
  state.roleSkills.push(
    {
      id: 'role-skill-go-dev-concurrency',
      roleId: 'role-go-dev',
      skillId: 'skill-go-concurrency',
      sortOrder: 10,
      isRequired: true,
      createdByUserId: 'user-1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'role-skill-platform-dev-concurrency',
      roleId: 'role-platform-dev',
      skillId: 'skill-go-concurrency',
      sortOrder: 10,
      isRequired: true,
      createdByUserId: 'user-1',
      createdAt: now,
      updatedAt: now,
    },
  );
  return state;
}

describe('skill catalog domain', () => {
  it('keeps skill nodes as tree leaves', () => {
    expect(() =>
      buildSkillCatalogTree([
        {
          id: 'node-skill',
          kind: 'SKILL',
          skillId: 'skill-go-concurrency',
          sortOrder: 1,
          createdByUserId: 'user-1',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'node-child',
          parentId: 'node-skill',
          kind: 'FOLDER',
          folderName: 'Invalid child',
          sortOrder: 1,
          createdByUserId: 'user-1',
          createdAt: now,
          updatedAt: now,
        },
      ]),
    ).toThrow('Skill catalog leaf nodes cannot have children');
  });

  it('allows the same grade for the same skill to differ by role', () => {
    const state = stateWithSharedSkill();
    const first = { roleSkillId: 'role-skill-go-dev-concurrency', gradeId: 'grade-middle', targetValue: 55 };
    const second = { roleSkillId: 'role-skill-platform-dev-concurrency', gradeId: 'grade-middle', targetValue: 70 };

    expect(() => assertRoleSkillGradeTarget(state, first)).not.toThrow();
    expect(() => assertRoleSkillGradeTarget(state, second)).not.toThrow();
    expect(first.targetValue).not.toBe(second.targetValue);
  });

  it('rejects grade targets outside the skill scale', () => {
    const state = stateWithSharedSkill();

    expect(() =>
      assertRoleSkillGradeTarget(state, {
        roleSkillId: 'role-skill-go-dev-concurrency',
        gradeId: 'grade-middle',
        targetValue: 101,
      }),
    ).toThrow('outside 0..100');
  });
});
