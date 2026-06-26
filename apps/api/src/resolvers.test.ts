import {
  AddSkillToCompetencyRoleDocument,
  CatalogSnapshotDocument,
  CreateCompetencyRoleDocument,
  CreateGradeDocument,
  CreateSkillCatalogFolderDocument,
  CreateSkillDocument,
  CreateSkillScaleMarkDocument,
  HealthDocument,
  MoveSkillCatalogNodeDocument,
  PlaceSkillInCatalogDocument,
  SetRoleSkillGradeTargetDocument,
  UpdateCompetencyRoleDocument,
  UpdateCompetencyRoleSkillDocument,
  UpdateGradeDocument,
  UpdateSkillCatalogFolderDocument,
  UpdateSkillDocument,
  UpdateSkillScaleMarkDocument,
  type AddSkillToCompetencyRoleMutation,
  type CatalogSnapshotQuery,
  type CreateCompetencyRoleMutation,
  type CreateGradeMutation,
  type CreateSkillCatalogFolderMutation,
  type CreateSkillMutation,
  type CreateSkillScaleMarkMutation,
  type HealthQuery,
  type MoveSkillCatalogNodeMutation,
  type PlaceSkillInCatalogMutation,
  type SetRoleSkillGradeTargetMutation,
  type UpdateCompetencyRoleMutation,
  type UpdateCompetencyRoleSkillMutation,
  type UpdateGradeMutation,
  type UpdateSkillCatalogFolderMutation,
  type UpdateSkillMutation,
  type UpdateSkillScaleMarkMutation,
} from '@comatrix/api-contracts';
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
  type ComatrixDb,
} from '@comatrix/db';
import { print } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createDrizzleCatalogRepository } from './catalog-repository.js';
import { createAppContext, createExecutableSchema } from './resolvers.js';

interface GraphQlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

const databaseUrl = process.env.COMATRIX_TEST_DATABASE_URL ?? process.env.COMATRIX_DATABASE_URL;
const describeWithDatabase = databaseUrl ? describe : describe.skip;

async function execute<TData>(
  yoga: ReturnType<typeof createYoga>,
  document: Parameters<typeof print>[0],
  variables?: Record<string, unknown>,
) {
  const response = await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: print(document), variables }),
  });

  const json = (await response.json()) as GraphQlResponse<TData>;

  expect(json.errors).toBeUndefined();
  expect(json.data).toBeDefined();

  return json.data as TData;
}

async function resetDatabase(db: ComatrixDb) {
  await db.delete(roleSkillGradeTargets);
  await db.delete(competencyRoleSkills);
  await db.delete(skillCatalogNodes);
  await db.delete(skillScaleMarks);
  await db.delete(competencyRoles);
  await db.delete(skills);
  await db.delete(grades);
}

describeWithDatabase('GraphQL API schema with Postgres persistence', () => {
  let pool: ReturnType<typeof createPool>;
  let db: ComatrixDb;

  beforeAll(() => {
    if (!databaseUrl) {
      throw new Error('COMATRIX_DATABASE_URL is required for persisted API tests');
    }
    pool = createPool(databaseUrl);
    db = createDb(pool);
  });

  beforeEach(async () => {
    await resetDatabase(db);
  });

  afterAll(async () => {
    await pool?.end();
  });

  function createTestYoga() {
    const repository = createDrizzleCatalogRepository(db);
    return createYoga({ schema: createExecutableSchema(repository), context: createAppContext() });
  }

  it('returns API health', async () => {
    const data = await execute<HealthQuery>(createTestYoga(), HealthDocument);

    expect(data.health).toEqual({ ok: true, service: 'comatrix-api' });
  });

  it('persists role-specific targets for the same skill and grade', async () => {
    const createdByUserId = 'user-admin';
    const yoga = createTestYoga();

    const gradeData = await execute<CreateGradeMutation>(yoga, CreateGradeDocument, {
      input: { name: 'Middle', createdByUserId },
    });
    const skillData = await execute<CreateSkillMutation>(yoga, CreateSkillDocument, {
      input: {
        name: 'Go concurrency',
        description: 'Goroutines, channels, context cancellation',
        scaleMin: 0,
        scaleMax: 5,
        scaleStep: 1,
        createdByUserId,
      },
    });
    const markData = await execute<CreateSkillScaleMarkMutation>(yoga, CreateSkillScaleMarkDocument, {
      input: {
        skillId: skillData.createSkill.id,
        value: 3,
        label: 'Middle target',
        description: 'Can use concurrency primitives in services',
      },
    });
    const updatedMarkData = await execute<UpdateSkillScaleMarkMutation>(yoga, UpdateSkillScaleMarkDocument, {
      input: {
        id: markData.createSkillScaleMark.id,
        value: 4,
        label: 'Strong target',
        sortOrder: 2,
      },
    });
    const folderData = await execute<CreateSkillCatalogFolderMutation>(yoga, CreateSkillCatalogFolderDocument, {
      input: { name: 'Backend', createdByUserId },
    });
    const updatedFolderData = await execute<UpdateSkillCatalogFolderMutation>(yoga, UpdateSkillCatalogFolderDocument, {
      input: {
        id: folderData.createSkillCatalogFolder.id,
        name: 'Platform',
      },
    });
    const runtimeFolderData = await execute<CreateSkillCatalogFolderMutation>(yoga, CreateSkillCatalogFolderDocument, {
      input: { name: 'Runtime', parentId: folderData.createSkillCatalogFolder.id, createdByUserId },
    });
    const placedSkillData = await execute<PlaceSkillInCatalogMutation>(yoga, PlaceSkillInCatalogDocument, {
      input: {
        parentId: folderData.createSkillCatalogFolder.id,
        skillId: skillData.createSkill.id,
        createdByUserId,
      },
    });
    const movedSkillData = await execute<MoveSkillCatalogNodeMutation>(yoga, MoveSkillCatalogNodeDocument, {
      input: {
        nodeId: placedSkillData.placeSkillInCatalog.id,
        parentId: runtimeFolderData.createSkillCatalogFolder.id,
        sortOrder: 1,
      },
    });
    const updatedGradeData = await execute<UpdateGradeMutation>(yoga, UpdateGradeDocument, {
      input: {
        id: gradeData.createGrade.id,
        name: 'Middle+',
        sortOrder: 2,
      },
    });
    const updatedSkillData = await execute<UpdateSkillMutation>(yoga, UpdateSkillDocument, {
      input: {
        id: skillData.createSkill.id,
        name: 'Go concurrency model',
        scaleMax: 6,
      },
    });
    const goRoleData = await execute<CreateCompetencyRoleMutation>(yoga, CreateCompetencyRoleDocument, {
      input: { name: 'Go developer', createdByUserId },
    });
    const updatedGoRoleData = await execute<UpdateCompetencyRoleMutation>(yoga, UpdateCompetencyRoleDocument, {
      input: {
        id: goRoleData.createCompetencyRole.id,
        description: 'Backend product role',
      },
    });
    const teamLeadRoleData = await execute<CreateCompetencyRoleMutation>(yoga, CreateCompetencyRoleDocument, {
      input: { name: 'Go team lead', createdByUserId },
    });
    const goRoleSkillData = await execute<AddSkillToCompetencyRoleMutation>(yoga, AddSkillToCompetencyRoleDocument, {
      input: {
        roleId: goRoleData.createCompetencyRole.id,
        skillId: skillData.createSkill.id,
        createdByUserId,
      },
    });
    const updatedGoRoleSkillData = await execute<UpdateCompetencyRoleSkillMutation>(
      yoga,
      UpdateCompetencyRoleSkillDocument,
      {
        input: {
          id: goRoleSkillData.addSkillToCompetencyRole.id,
          sortOrder: 2,
          isRequired: false,
        },
      },
    );
    const teamLeadRoleSkillData = await execute<AddSkillToCompetencyRoleMutation>(
      yoga,
      AddSkillToCompetencyRoleDocument,
      {
        input: {
          roleId: teamLeadRoleData.createCompetencyRole.id,
          skillId: skillData.createSkill.id,
          createdByUserId,
        },
      },
    );

    const goTargetData = await execute<SetRoleSkillGradeTargetMutation>(yoga, SetRoleSkillGradeTargetDocument, {
      input: {
        roleSkillId: goRoleSkillData.addSkillToCompetencyRole.id,
        gradeId: gradeData.createGrade.id,
        targetValue: 3,
        createdByUserId,
      },
    });
    const teamLeadTargetData = await execute<SetRoleSkillGradeTargetMutation>(yoga, SetRoleSkillGradeTargetDocument, {
      input: {
        roleSkillId: teamLeadRoleSkillData.addSkillToCompetencyRole.id,
        gradeId: gradeData.createGrade.id,
        targetValue: 5,
        createdByUserId,
      },
    });

    const persistedSnapshot = await execute<CatalogSnapshotQuery>(createTestYoga(), CatalogSnapshotDocument);
    const goRole = persistedSnapshot.competencyRoles.find((role) => role.id === goRoleData.createCompetencyRole.id);
    const teamLeadRole = persistedSnapshot.competencyRoles.find(
      (role) => role.id === teamLeadRoleData.createCompetencyRole.id,
    );
    const movedNode = persistedSnapshot.skillCatalogNodes.find((node) => node.id === placedSkillData.placeSkillInCatalog.id);
    const updatedSkill = persistedSnapshot.skills.find((skill) => skill.id === skillData.createSkill.id);
    const goTarget = goRole?.skills[0]?.gradeTargets[0];
    const teamLeadTarget = teamLeadRole?.skills[0]?.gradeTargets[0];

    expect(placedSkillData.placeSkillInCatalog.parentId).toBe(folderData.createSkillCatalogFolder.id);
    expect(updatedFolderData.updateSkillCatalogFolder.folderName).toBe('Platform');
    expect(movedSkillData.moveSkillCatalogNode.parentId).toBe(runtimeFolderData.createSkillCatalogFolder.id);
    expect(movedNode?.parentId).toBe(runtimeFolderData.createSkillCatalogFolder.id);
    expect(updatedGradeData.updateGrade.name).toBe('Middle+');
    expect(updatedSkillData.updateSkill.name).toBe('Go concurrency model');
    expect(updatedSkill?.marks[0]?.label).toBe('Strong target');
    expect(updatedMarkData.updateSkillScaleMark.value).toBe(4);
    expect(updatedGoRoleData.updateCompetencyRole.description).toBe('Backend product role');
    expect(updatedGoRoleSkillData.updateCompetencyRoleSkill.isRequired).toBe(false);
    expect(goTarget?.grade.id).toBe(updatedGradeData.updateGrade.id);
    expect(teamLeadTarget?.grade.id).toBe(updatedGradeData.updateGrade.id);
    expect(goTarget?.targetValue).toBe(3);
    expect(teamLeadTarget?.targetValue).toBe(5);
    expect(goTargetData.setRoleSkillGradeTarget.roleSkillId).not.toBe(
      teamLeadTargetData.setRoleSkillGradeTarget.roleSkillId,
    );
  });
});
