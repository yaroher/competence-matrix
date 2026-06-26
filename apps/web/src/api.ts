import {
  AddSkillToCompetencyRoleDocument,
  CatalogSnapshotDocument,
  CreateCompetencyRoleDocument,
  CreateGradeDocument,
  CreateSkillCatalogFolderDocument,
  CreateSkillDocument,
  CreateSkillScaleMarkDocument,
  DeleteSkillCatalogNodeDocument,
  DeleteSkillScaleMarkDocument,
  HealthDocument,
  MoveSkillCatalogNodeDocument,
  PlaceSkillInCatalogDocument,
  RemoveSkillFromCompetencyRoleDocument,
  SetRoleSkillGradeTargetDocument,
  UpdateCompetencyRoleDocument,
  UpdateCompetencyRoleSkillDocument,
  UpdateGradeDocument,
  UpdateSkillCatalogFolderDocument,
  UpdateSkillDocument,
  UpdateSkillScaleMarkDocument,
  type AddSkillToCompetencyRoleMutationVariables,
  type CatalogSnapshotQuery,
  type CreateCompetencyRoleMutationVariables,
  type CreateGradeMutationVariables,
  type CreateSkillCatalogFolderMutationVariables,
  type CreateSkillMutationVariables,
  type CreateSkillScaleMarkMutationVariables,
  type DeleteSkillCatalogNodeMutationVariables,
  type DeleteSkillScaleMarkMutationVariables,
  type HealthQuery,
  type MoveSkillCatalogNodeMutationVariables,
  type PlaceSkillInCatalogMutationVariables,
  type RemoveSkillFromCompetencyRoleMutationVariables,
  type SetRoleSkillGradeTargetMutationVariables,
  type UpdateCompetencyRoleMutationVariables,
  type UpdateCompetencyRoleSkillMutationVariables,
  type UpdateGradeMutationVariables,
  type UpdateSkillCatalogFolderMutationVariables,
  type UpdateSkillMutationVariables,
  type UpdateSkillScaleMarkMutationVariables,
} from '@comatrix/api-contracts';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { print } from 'graphql';

interface GraphQlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export type HealthVm = HealthQuery['health'];
export type CatalogSnapshotVm = CatalogSnapshotQuery;
export type GradeVm = CatalogSnapshotVm['grades'][number];
export type SkillVm = CatalogSnapshotVm['skills'][number];
export type CatalogNodeVm = CatalogSnapshotVm['skillCatalogNodes'][number];
export type CompetencyRoleVm = CatalogSnapshotVm['competencyRoles'][number];
export type CompetencyRoleSkillVm = CompetencyRoleVm['skills'][number];
export type RoleSkillGradeTargetVm = CompetencyRoleSkillVm['gradeTargets'][number];

async function executeGraphQl<TData, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): Promise<TData> {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: print(document), variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with HTTP ${response.status}`);
  }

  const body = (await response.json()) as GraphQlResponse<TData>;
  if (body.errors?.length || !body.data) {
    throw new Error(body.errors?.map((error) => error.message).join('\n') ?? 'GraphQL response is empty');
  }

  return body.data;
}

export async function loadHealth(): Promise<HealthVm> {
  return (await executeGraphQl(HealthDocument)).health;
}

export async function loadCatalogSnapshot(): Promise<CatalogSnapshotVm> {
  return executeGraphQl(CatalogSnapshotDocument);
}

export async function createGrade(input: CreateGradeMutationVariables['input']) {
  return (await executeGraphQl(CreateGradeDocument, { input })).createGrade;
}

export async function updateGrade(input: UpdateGradeMutationVariables['input']) {
  return (await executeGraphQl(UpdateGradeDocument, { input })).updateGrade;
}

export async function createSkill(input: CreateSkillMutationVariables['input']) {
  return (await executeGraphQl(CreateSkillDocument, { input })).createSkill;
}

export async function updateSkill(input: UpdateSkillMutationVariables['input']) {
  return (await executeGraphQl(UpdateSkillDocument, { input })).updateSkill;
}

export async function createSkillScaleMark(input: CreateSkillScaleMarkMutationVariables['input']) {
  return (await executeGraphQl(CreateSkillScaleMarkDocument, { input })).createSkillScaleMark;
}

export async function updateSkillScaleMark(input: UpdateSkillScaleMarkMutationVariables['input']) {
  return (await executeGraphQl(UpdateSkillScaleMarkDocument, { input })).updateSkillScaleMark;
}

export async function deleteSkillScaleMark(input: DeleteSkillScaleMarkMutationVariables['input']) {
  return (await executeGraphQl(DeleteSkillScaleMarkDocument, { input })).deleteSkillScaleMark;
}

export async function createSkillCatalogFolder(input: CreateSkillCatalogFolderMutationVariables['input']) {
  return (await executeGraphQl(CreateSkillCatalogFolderDocument, { input })).createSkillCatalogFolder;
}

export async function updateSkillCatalogFolder(input: UpdateSkillCatalogFolderMutationVariables['input']) {
  return (await executeGraphQl(UpdateSkillCatalogFolderDocument, { input })).updateSkillCatalogFolder;
}

export async function placeSkillInCatalog(input: PlaceSkillInCatalogMutationVariables['input']) {
  return (await executeGraphQl(PlaceSkillInCatalogDocument, { input })).placeSkillInCatalog;
}

export async function moveSkillCatalogNode(input: MoveSkillCatalogNodeMutationVariables['input']) {
  return (await executeGraphQl(MoveSkillCatalogNodeDocument, { input })).moveSkillCatalogNode;
}

export async function deleteSkillCatalogNode(input: DeleteSkillCatalogNodeMutationVariables['input']) {
  return (await executeGraphQl(DeleteSkillCatalogNodeDocument, { input })).deleteSkillCatalogNode;
}

export async function createCompetencyRole(input: CreateCompetencyRoleMutationVariables['input']) {
  return (await executeGraphQl(CreateCompetencyRoleDocument, { input })).createCompetencyRole;
}

export async function updateCompetencyRole(input: UpdateCompetencyRoleMutationVariables['input']) {
  return (await executeGraphQl(UpdateCompetencyRoleDocument, { input })).updateCompetencyRole;
}

export async function addSkillToCompetencyRole(input: AddSkillToCompetencyRoleMutationVariables['input']) {
  return (await executeGraphQl(AddSkillToCompetencyRoleDocument, { input })).addSkillToCompetencyRole;
}

export async function updateCompetencyRoleSkill(input: UpdateCompetencyRoleSkillMutationVariables['input']) {
  return (await executeGraphQl(UpdateCompetencyRoleSkillDocument, { input })).updateCompetencyRoleSkill;
}

export async function removeSkillFromCompetencyRole(input: RemoveSkillFromCompetencyRoleMutationVariables['input']) {
  return (await executeGraphQl(RemoveSkillFromCompetencyRoleDocument, { input })).removeSkillFromCompetencyRole;
}

export async function setRoleSkillGradeTarget(input: SetRoleSkillGradeTargetMutationVariables['input']) {
  return (await executeGraphQl(SetRoleSkillGradeTargetDocument, { input })).setRoleSkillGradeTarget;
}
