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
import {
  MeDocument,
  EmployeesDocument,
  AppRolesDocument,
  UsersDocument,
  MyAssignmentsDocument,
  AssignmentsForEmployeeDocument,
  LoginDocument,
  CreateAppRoleDocument,
  UpdateAppRoleDocument,
  DeleteAppRoleDocument,
  CreateEmployeeDocument,
  UpdateEmployeeDocument,
  DeleteEmployeeDocument,
  CreateUserDocument,
  UpdateUserDocument,
  DeleteUserDocument,
  AssignMatrixDocument,
  UpdateAssignmentDocument,
  RemoveAssignmentDocument,
  SetAssessmentDocument,
  type Permission,
  type MeQuery,
  type AppRolesQuery,
  type EmployeesQuery,
  type UsersQuery,
  type MyAssignmentsQuery,
  type LoginMutationVariables,
  type CreateAppRoleMutationVariables,
  type UpdateAppRoleMutationVariables,
  type CreateEmployeeMutationVariables,
  type UpdateEmployeeMutationVariables,
  type CreateUserMutationVariables,
  type UpdateUserMutationVariables,
  type AssignMatrixMutationVariables,
  type UpdateAssignmentMutationVariables,
  type SetAssessmentMutationVariables,
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

const TOKEN_KEY = 'comatrix-token';

export function getToken(): string | null {
  return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof localStorage === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function executeGraphQl<TData, TVariables extends Record<string, unknown>>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): Promise<TData> {
  const token = getToken();
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
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

// --- access control / org / assignments / assessments ---

export type { Permission };
export type ViewerVm = NonNullable<MeQuery['me']>;
export type AppRoleVm = AppRolesQuery['appRoles'][number];
export type EmployeeVm = EmployeesQuery['employees'][number];
export type AppUserVm = UsersQuery['users'][number];
export type AssignmentVm = MyAssignmentsQuery['myAssignments'][number];
export type AssessmentVm = AssignmentVm['assessments'][number];

export async function login(input: LoginMutationVariables['input']) {
  return (await executeGraphQl(LoginDocument, { input })).login;
}

export async function loadMe(): Promise<ViewerVm | null> {
  return (await executeGraphQl(MeDocument)).me ?? null;
}

export async function loadEmployees() {
  return (await executeGraphQl(EmployeesDocument)).employees;
}

export async function loadAppRoles() {
  return executeGraphQl(AppRolesDocument);
}

export async function loadUsers() {
  return (await executeGraphQl(UsersDocument)).users;
}

export async function loadMyAssignments() {
  return (await executeGraphQl(MyAssignmentsDocument)).myAssignments;
}

export async function loadAssignmentsForEmployee(employeeId: string) {
  return (await executeGraphQl(AssignmentsForEmployeeDocument, { employeeId })).assignmentsForEmployee;
}

export async function createAppRole(input: CreateAppRoleMutationVariables['input']) {
  return (await executeGraphQl(CreateAppRoleDocument, { input })).createAppRole;
}

export async function updateAppRole(input: UpdateAppRoleMutationVariables['input']) {
  return (await executeGraphQl(UpdateAppRoleDocument, { input })).updateAppRole;
}

export async function deleteAppRole(id: string) {
  return (await executeGraphQl(DeleteAppRoleDocument, { input: { id } })).deleteAppRole;
}

export async function createEmployee(input: CreateEmployeeMutationVariables['input']) {
  return (await executeGraphQl(CreateEmployeeDocument, { input })).createEmployee;
}

export async function updateEmployee(input: UpdateEmployeeMutationVariables['input']) {
  return (await executeGraphQl(UpdateEmployeeDocument, { input })).updateEmployee;
}

export async function deleteEmployee(id: string) {
  return (await executeGraphQl(DeleteEmployeeDocument, { input: { id } })).deleteEmployee;
}

export async function createUser(input: CreateUserMutationVariables['input']) {
  return (await executeGraphQl(CreateUserDocument, { input })).createUser;
}

export async function updateUser(input: UpdateUserMutationVariables['input']) {
  return (await executeGraphQl(UpdateUserDocument, { input })).updateUser;
}

export async function deleteUser(id: string) {
  return (await executeGraphQl(DeleteUserDocument, { input: { id } })).deleteUser;
}

export async function assignMatrix(input: AssignMatrixMutationVariables['input']) {
  return (await executeGraphQl(AssignMatrixDocument, { input })).assignMatrix;
}

export async function updateAssignment(input: UpdateAssignmentMutationVariables['input']) {
  return (await executeGraphQl(UpdateAssignmentDocument, { input })).updateAssignment;
}

export async function removeAssignment(id: string) {
  return (await executeGraphQl(RemoveAssignmentDocument, { input: { id } })).removeAssignment;
}

export async function setAssessment(input: SetAssessmentMutationVariables['input']) {
  return (await executeGraphQl(SetAssessmentDocument, { input })).setAssessment;
}
