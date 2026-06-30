// AUTO-GENERATED from schema.graphql by scripts/generate-schema-ts.mjs.
// Do not edit by hand — change schema.graphql and run `yarn codegen`.
export const schema = /* GraphQL */ `
type Query {
  health: Health!
  grades: [Grade!]!
  skills: [Skill!]!
  skillCatalogNodes: [SkillCatalogNode!]!
  skillCatalogTree: [SkillCatalogNode!]!
  competencyRoles: [CompetencyRole!]!
  competencyRole(id: ID!): CompetencyRole
  me: Viewer
  permissions: [Permission!]!
  appRoles: [AppRole!]!
  employees: [Employee!]!
  users: [AppUser!]!
  myAssignments: [MatrixAssignment!]!
  assignmentsForEmployee(employeeId: ID!): [MatrixAssignment!]!
  assignment(id: ID!): MatrixAssignment
}

type Mutation {
  createGrade(input: CreateGradeInput!): Grade!
  updateGrade(input: UpdateGradeInput!): Grade!
  createSkill(input: CreateSkillInput!): Skill!
  updateSkill(input: UpdateSkillInput!): Skill!
  createSkillScaleMark(input: CreateSkillScaleMarkInput!): SkillScaleMark!
  updateSkillScaleMark(input: UpdateSkillScaleMarkInput!): SkillScaleMark!
  deleteSkillScaleMark(input: DeleteSkillScaleMarkInput!): ID!
  createSkillCatalogFolder(input: CreateSkillCatalogFolderInput!): SkillCatalogNode!
  updateSkillCatalogFolder(input: UpdateSkillCatalogFolderInput!): SkillCatalogNode!
  placeSkillInCatalog(input: PlaceSkillInCatalogInput!): SkillCatalogNode!
  moveSkillCatalogNode(input: MoveSkillCatalogNodeInput!): SkillCatalogNode!
  deleteSkillCatalogNode(input: DeleteSkillCatalogNodeInput!): ID!
  createCompetencyRole(input: CreateCompetencyRoleInput!): CompetencyRole!
  updateCompetencyRole(input: UpdateCompetencyRoleInput!): CompetencyRole!
  addSkillToCompetencyRole(input: AddSkillToCompetencyRoleInput!): CompetencyRoleSkill!
  updateCompetencyRoleSkill(input: UpdateCompetencyRoleSkillInput!): CompetencyRoleSkill!
  removeSkillFromCompetencyRole(input: RemoveSkillFromCompetencyRoleInput!): ID!
  setRoleSkillGradeTarget(input: SetRoleSkillGradeTargetInput!): RoleSkillGradeTarget!
  login(input: LoginInput!): AuthPayload!
  createAppRole(input: CreateAppRoleInput!): AppRole!
  updateAppRole(input: UpdateAppRoleInput!): AppRole!
  deleteAppRole(input: DeleteByIdInput!): ID!
  createEmployee(input: CreateEmployeeInput!): Employee!
  updateEmployee(input: UpdateEmployeeInput!): Employee!
  deleteEmployee(input: DeleteByIdInput!): ID!
  createUser(input: CreateUserInput!): AppUser!
  updateUser(input: UpdateUserInput!): AppUser!
  deleteUser(input: DeleteByIdInput!): ID!
  assignMatrix(input: AssignMatrixInput!): MatrixAssignment!
  updateAssignment(input: UpdateAssignmentInput!): MatrixAssignment!
  removeAssignment(input: DeleteByIdInput!): ID!
  setAssessment(input: SetAssessmentInput!): Assessment!
}

type Health {
  ok: Boolean!
  service: String!
}

type Grade {
  id: ID!
  name: String!
  sortOrder: Int!
  createdByUserId: ID!
  createdAt: String!
  updatedAt: String!
  archivedAt: String
}

type Skill {
  id: ID!
  name: String!
  description: String!
  scaleMin: Int!
  scaleMax: Int!
  scaleStep: Int!
  marks: [SkillScaleMark!]!
  createdByUserId: ID!
  createdAt: String!
  updatedAt: String!
  archivedAt: String
}

type SkillScaleMark {
  id: ID!
  skillId: ID!
  skill: Skill!
  value: Int!
  label: String!
  description: String!
  sortOrder: Int!
}

enum SkillCatalogNodeKind {
  FOLDER
  SKILL
}

type SkillCatalogNode {
  id: ID!
  parentId: ID
  parent: SkillCatalogNode
  kind: SkillCatalogNodeKind!
  folderName: String
  skillId: ID
  skill: Skill
  children: [SkillCatalogNode!]!
  sortOrder: Int!
  createdByUserId: ID!
  createdAt: String!
  updatedAt: String!
  archivedAt: String
}

type CompetencyRole {
  id: ID!
  name: String!
  description: String!
  skills: [CompetencyRoleSkill!]!
  createdByUserId: ID!
  createdAt: String!
  updatedAt: String!
  archivedAt: String
}

type CompetencyRoleSkill {
  id: ID!
  roleId: ID!
  role: CompetencyRole!
  skillId: ID!
  skill: Skill!
  sortOrder: Int!
  isRequired: Boolean!
  gradeTargets: [RoleSkillGradeTarget!]!
  createdByUserId: ID!
  createdAt: String!
  updatedAt: String!
}

type RoleSkillGradeTarget {
  id: ID!
  roleSkillId: ID!
  roleSkill: CompetencyRoleSkill!
  gradeId: ID!
  grade: Grade!
  targetValue: Int!
  createdByUserId: ID!
  createdAt: String!
  updatedAt: String!
}

input CreateGradeInput {
  name: String!
  sortOrder: Int
  createdByUserId: ID!
}

input UpdateGradeInput {
  id: ID!
  name: String
  sortOrder: Int
}

input CreateSkillInput {
  name: String!
  description: String
  scaleMin: Int!
  scaleMax: Int!
  scaleStep: Int!
  createdByUserId: ID!
}

input UpdateSkillInput {
  id: ID!
  name: String
  description: String
  scaleMin: Int
  scaleMax: Int
  scaleStep: Int
}

input CreateSkillScaleMarkInput {
  skillId: ID!
  value: Int!
  label: String!
  description: String
  sortOrder: Int
}

input UpdateSkillScaleMarkInput {
  id: ID!
  value: Int
  label: String
  description: String
  sortOrder: Int
}

input DeleteSkillScaleMarkInput {
  id: ID!
}

input CreateSkillCatalogFolderInput {
  parentId: ID
  name: String!
  sortOrder: Int
  createdByUserId: ID!
}

input UpdateSkillCatalogFolderInput {
  id: ID!
  name: String
}

input PlaceSkillInCatalogInput {
  parentId: ID
  skillId: ID!
  sortOrder: Int
  createdByUserId: ID!
}

input MoveSkillCatalogNodeInput {
  nodeId: ID!
  parentId: ID
  sortOrder: Int
}

input DeleteSkillCatalogNodeInput {
  id: ID!
}

input CreateCompetencyRoleInput {
  name: String!
  description: String
  createdByUserId: ID!
}

input UpdateCompetencyRoleInput {
  id: ID!
  name: String
  description: String
}

input AddSkillToCompetencyRoleInput {
  roleId: ID!
  skillId: ID!
  sortOrder: Int
  isRequired: Boolean
  createdByUserId: ID!
}

input UpdateCompetencyRoleSkillInput {
  id: ID!
  sortOrder: Int
  isRequired: Boolean
}

input RemoveSkillFromCompetencyRoleInput {
  id: ID!
}

input SetRoleSkillGradeTargetInput {
  roleSkillId: ID!
  gradeId: ID!
  targetValue: Int!
  createdByUserId: ID!
}

# --- access control, org tree, assignments, assessments ---

enum Permission {
  MANAGE_CATALOG
  MANAGE_MATRICES
  MANAGE_ORG
  ASSIGN_MATRICES
  MANAGE_USERS_ROLES
  VIEW_ALL_ASSESSMENTS
}

enum AssessmentKind {
  SELF
  MANAGER
}

type AppRole {
  id: ID!
  name: String!
  isSystem: Boolean!
  permissions: [Permission!]!
}

type Employee {
  id: ID!
  fullName: String!
  title: String!
  managerId: ID
  manager: Employee
  reports: [Employee!]!
  createdAt: String!
  updatedAt: String!
}

type AppUser {
  id: ID!
  email: String!
  displayName: String!
  roleId: ID!
  role: AppRole!
  employeeId: ID
  employee: Employee
}

type Viewer {
  id: ID!
  email: String!
  displayName: String!
  role: AppRole!
  permissions: [Permission!]!
  employee: Employee
}

type AuthPayload {
  token: String!
  user: Viewer!
}

type MatrixAssignment {
  id: ID!
  employeeId: ID!
  employee: Employee!
  roleId: ID!
  role: CompetencyRole!
  gradeId: ID!
  grade: Grade!
  assessments: [Assessment!]!
  canAssessSelf: Boolean!
  canAssessManager: Boolean!
  createdAt: String!
  updatedAt: String!
}

type Assessment {
  id: ID!
  assignmentId: ID!
  skillId: ID!
  assessorUserId: ID!
  assessorName: String!
  kind: AssessmentKind!
  value: Int!
  updatedAt: String!
}

input LoginInput {
  email: String!
  password: String!
}

input DeleteByIdInput {
  id: ID!
}

input CreateAppRoleInput {
  name: String!
  permissions: [Permission!]!
}

input UpdateAppRoleInput {
  id: ID!
  name: String
  permissions: [Permission!]
}

input CreateEmployeeInput {
  fullName: String!
  title: String
  managerId: ID
}

input UpdateEmployeeInput {
  id: ID!
  fullName: String
  title: String
  managerId: ID
}

input CreateUserInput {
  email: String!
  password: String!
  displayName: String!
  roleId: ID!
  employeeId: ID
}

input UpdateUserInput {
  id: ID!
  email: String
  displayName: String
  password: String
  roleId: ID
  employeeId: ID
}

input AssignMatrixInput {
  employeeId: ID!
  roleId: ID!
  gradeId: ID!
}

input UpdateAssignmentInput {
  id: ID!
  gradeId: ID!
}

input SetAssessmentInput {
  assignmentId: ID!
  skillId: ID!
  value: Int!
}
`;
