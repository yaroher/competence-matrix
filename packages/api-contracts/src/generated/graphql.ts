/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AssessmentScoreInput = {
  readonly assessmentId: string;
  readonly comment?: string | null | undefined;
  readonly competencyId: string;
  readonly confidence?: number | null | undefined;
  readonly level: number;
  readonly source: string;
  readonly verificationStatus?: string | null | undefined;
};

export type CalibrationDecisionInput = {
  readonly assessmentScoreId: string;
  readonly calibratedLevel: number;
  readonly originalLevel: number;
  readonly reason?: string | null | undefined;
  readonly sessionId: string;
};

export type CompetencyCategoryInput = {
  readonly categoryType: string;
  readonly description?: string | null | undefined;
  readonly name: string;
  readonly organizationId: string;
  readonly parentId?: string | null | undefined;
};

export type CompetencyImportInput = {
  readonly category: string;
  readonly categoryType?: string | null | undefined;
  readonly code: string;
  readonly description?: string | null | undefined;
  readonly name: string;
  readonly tags?: ReadonlyArray<string> | null | undefined;
};

export type CompetencyInput = {
  readonly categoryId: string;
  readonly code: string;
  readonly description?: string | null | undefined;
  readonly name: string;
  readonly organizationId: string;
  readonly tags?: ReadonlyArray<string> | null | undefined;
};

export type CreateAssessmentInput = {
  readonly matrixRevisionId: string;
  readonly personId: string;
  readonly roleProfileId: string;
};

export type CreateAssignmentInput = {
  readonly effectiveFrom: string;
  readonly managerPersonId?: string | null | undefined;
  readonly orgUnitId: string;
  readonly personId: string;
  readonly roleProfileId: string;
};

export type CreatePersonInput = {
  readonly email: string;
  readonly fullName: string;
};

export type GradeInput = {
  readonly name: string;
  readonly organizationId: string;
  readonly rank: number;
};

export type LevelDimensionDescriptorInput = {
  readonly description: string;
  readonly dimension: string;
  readonly levelValue: number;
  readonly scaleId: string;
};

export type MatrixInput = {
  readonly name: string;
  readonly roleProfileId: string;
};

export type MatrixRequirementInput = {
  readonly competencyId: string;
  readonly criticality: string;
  readonly neededOnEntry?: boolean | null | undefined;
  readonly normalizedWeight: number;
  readonly revisionId: string;
  readonly targetLevel: number;
};

export type NameInput = {
  readonly name: string;
  readonly organizationId: string;
};

export type OrgUnitInput = {
  readonly name: string;
  readonly organizationId: string;
  readonly parentId?: string | null | undefined;
  readonly type: string;
};

export type RoleInput = {
  readonly name: string;
  readonly roleFamilyId: string;
};

export type RoleProfileInput = {
  readonly description?: string | null | undefined;
  readonly gradeId: string;
  readonly name: string;
  readonly roleId: string;
};

export type RoleTaskInput = {
  readonly criticality: string;
  readonly expectedOutcome: string;
  readonly name: string;
  readonly roleProfileId: string;
};

export type ScoringRuleInput = {
  readonly confidenceThreshold?: number | null | undefined;
  readonly name: string;
  readonly organizationId: string;
};

export type UpdateCompetencyCategoryInput = {
  readonly categoryType?: string | null | undefined;
  readonly description?: string | null | undefined;
  readonly id: string;
  readonly name?: string | null | undefined;
};

export type UpdateCompetencyInput = {
  readonly categoryId?: string | null | undefined;
  readonly description?: string | null | undefined;
  readonly id: string;
  readonly name?: string | null | undefined;
  readonly tags?: ReadonlyArray<string> | null | undefined;
};

export type UpdateDevelopmentPlanItemInput = {
  readonly dueDate?: string | null | undefined;
  readonly id: string;
  readonly status?: string | null | undefined;
};

export type UpdatePersonInput = {
  readonly email?: string | null | undefined;
  readonly fullName?: string | null | undefined;
  readonly id: string;
  readonly status?: string | null | undefined;
};

export type ManagerDashboardQueryVariables = Exact<{
  managerPersonId: string;
}>;


export type ManagerDashboardQuery = { readonly managerDashboard: { readonly managerPersonId: string, readonly reports: ReadonlyArray<{ readonly personId: string, readonly fullName: string, readonly hasAssessment: boolean, readonly gapCount: number, readonly criticalGapCount: number }> } | null };

export type OrganizationGapSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationGapSummaryQuery = { readonly organizationGapSummary: { readonly assessedPeople: number, readonly totalPeople: number, readonly coveragePercent: number, readonly criticalGapCount: number, readonly byCompetency: ReadonlyArray<{ readonly competencyName: string, readonly criticality: string, readonly avgGap: number, readonly isCritical: boolean }> } };

export type OrganizationCoverageQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationCoverageQuery = { readonly organizationGapSummary: { readonly coveragePercent: number } };

export type AssessmentsAdminQueryVariables = Exact<{ [key: string]: never; }>;


export type AssessmentsAdminQuery = { readonly people: ReadonlyArray<{ readonly id: string, readonly fullName: string }>, readonly roleProfiles: ReadonlyArray<{ readonly id: string, readonly name: string }>, readonly matrices: ReadonlyArray<{ readonly id: string, readonly name: string, readonly activeRevision: { readonly id: string } }>, readonly assessments: ReadonlyArray<{ readonly id: string, readonly status: string, readonly person: { readonly id: string, readonly fullName: string }, readonly roleProfile: { readonly id: string, readonly name: string }, readonly scores: ReadonlyArray<{ readonly id: string, readonly source: string, readonly level: number, readonly confidence: number, readonly verificationStatus: string, readonly comment: string, readonly competency: { readonly id: string, readonly code: string, readonly name: string } }> }>, readonly competencies: { readonly competencies: ReadonlyArray<{ readonly id: string, readonly code: string, readonly name: string }> } };

export type CreateAssessmentMutationVariables = Exact<{
  input: CreateAssessmentInput;
}>;


export type CreateAssessmentMutation = { readonly createAssessment: { readonly id: string, readonly status: string } };

export type UpsertAssessmentScoreMutationVariables = Exact<{
  input: AssessmentScoreInput;
}>;


export type UpsertAssessmentScoreMutation = { readonly upsertAssessmentScore: { readonly id: string, readonly level: number, readonly source: string } };

export type FinalizeAssessmentAdminMutationVariables = Exact<{
  id: string;
}>;


export type FinalizeAssessmentAdminMutation = { readonly finalizeAssessment: { readonly id: string, readonly status: string } };

export type AuditEventsRecentQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type AuditEventsRecentQuery = { readonly auditEvents: ReadonlyArray<{ readonly action: string, readonly entityType: string, readonly entityId: string, readonly actorUserId: string | null, readonly createdAt: string }> };

export type AuditEventsForEntityQueryVariables = Exact<{
  entityType: string;
  entityId: string;
}>;


export type AuditEventsForEntityQuery = { readonly auditEvents: ReadonlyArray<{ readonly action: string }> };

export type FinalizeAssessmentMutationVariables = Exact<{
  id: string;
}>;


export type FinalizeAssessmentMutation = { readonly finalizeAssessment: { readonly id: string, readonly status: string } };

export type ActivateMatrixMutationVariables = Exact<{
  id: string;
}>;


export type ActivateMatrixMutation = { readonly activateMatrix: { readonly id: string, readonly status: string } };

export type CalibrationSessionsDetailedQueryVariables = Exact<{ [key: string]: never; }>;


export type CalibrationSessionsDetailedQuery = { readonly calibrationSessions: ReadonlyArray<{ readonly id: string, readonly name: string, readonly status: string, readonly decisions: ReadonlyArray<{ readonly id: string, readonly originalLevel: number, readonly calibratedLevel: number, readonly diff: number, readonly reason: string, readonly score: { readonly id: string, readonly competency: { readonly name: string } } }> }>, readonly assessments: ReadonlyArray<{ readonly id: string, readonly person: { readonly fullName: string }, readonly scores: ReadonlyArray<{ readonly id: string, readonly level: number, readonly source: string, readonly competency: { readonly name: string } }> }> };

export type CreateCalibrationSessionMutationVariables = Exact<{
  input: NameInput;
}>;


export type CreateCalibrationSessionMutation = { readonly createCalibrationSession: { readonly id: string, readonly name: string, readonly status: string } };

export type CloseCalibrationSessionMutationVariables = Exact<{
  id: string;
}>;


export type CloseCalibrationSessionMutation = { readonly closeCalibrationSession: { readonly id: string, readonly status: string } };

export type AddCalibrationDecisionMutationVariables = Exact<{
  input: CalibrationDecisionInput;
}>;


export type AddCalibrationDecisionMutation = { readonly addCalibrationDecision: { readonly id: string, readonly calibratedLevel: number } };

export type DeleteCalibrationDecisionMutationVariables = Exact<{
  id: string;
}>;


export type DeleteCalibrationDecisionMutation = { readonly deleteCalibrationDecision: boolean };

export type DevelopmentAdminQueryVariables = Exact<{
  assessmentId: string;
}>;


export type DevelopmentAdminQuery = { readonly developmentPlan: { readonly id: string, readonly person: { readonly id: string, readonly fullName: string }, readonly assessment: { readonly id: string, readonly status: string }, readonly items: ReadonlyArray<{ readonly id: string, readonly title: string, readonly gap: number, readonly status: string, readonly dueDate: string, readonly competency: { readonly id: string, readonly code: string, readonly name: string } }> } | null, readonly assessments: ReadonlyArray<{ readonly id: string, readonly status: string, readonly person: { readonly fullName: string } }> };

export type UpdateDevelopmentPlanItemMutationVariables = Exact<{
  input: UpdateDevelopmentPlanItemInput;
}>;


export type UpdateDevelopmentPlanItemMutation = { readonly updateDevelopmentPlanItem: { readonly id: string, readonly status: string, readonly dueDate: string } };

export type ExportMatrixAndGapsQueryVariables = Exact<{
  matrixRevisionId: string;
  assessmentId: string;
}>;


export type ExportMatrixAndGapsQuery = { readonly exportMatrixRequirements: ReadonlyArray<{ readonly competencyCode: string, readonly competencyName: string, readonly targetLevel: number, readonly criticality: string }>, readonly exportGapSummary: ReadonlyArray<{ readonly competencyCode: string, readonly gap: number, readonly weightedGap: number }> };

export type ImportCompetenciesMutationVariables = Exact<{
  input: ReadonlyArray<CompetencyImportInput> | CompetencyImportInput;
}>;


export type ImportCompetenciesMutation = { readonly importCompetencies: { readonly applied: boolean, readonly valid: boolean, readonly rowCount: number, readonly categoriesParsed: number, readonly competenciesParsed: number, readonly errors: ReadonlyArray<{ readonly row: number, readonly field: string | null, readonly message: string }> } };

export type MatricesAdminQueryVariables = Exact<{ [key: string]: never; }>;


export type MatricesAdminQuery = { readonly roleProfiles: ReadonlyArray<{ readonly id: string, readonly name: string }>, readonly matrices: ReadonlyArray<{ readonly id: string, readonly name: string, readonly status: string, readonly roleProfile: { readonly id: string, readonly name: string }, readonly activeRevision: { readonly id: string, readonly version: number, readonly requirements: ReadonlyArray<{ readonly id: string, readonly targetLevel: number, readonly normalizedWeight: number, readonly criticality: string, readonly neededOnEntry: boolean, readonly competency: { readonly id: string, readonly code: string, readonly name: string } }> } }>, readonly competencies: { readonly competencies: ReadonlyArray<{ readonly id: string, readonly code: string, readonly name: string }> } };

export type CreateMatrixMutationVariables = Exact<{
  input: MatrixInput;
}>;


export type CreateMatrixMutation = { readonly createMatrix: { readonly id: string, readonly name: string, readonly status: string } };

export type UpsertMatrixRequirementMutationVariables = Exact<{
  input: MatrixRequirementInput;
}>;


export type UpsertMatrixRequirementMutation = { readonly upsertMatrixRequirement: { readonly id: string, readonly targetLevel: number, readonly normalizedWeight: number, readonly criticality: string } };

export type DeleteMatrixRequirementMutationVariables = Exact<{
  id: string;
}>;


export type DeleteMatrixRequirementMutation = { readonly deleteMatrixRequirement: boolean };

export type LevelScalesDetailedQueryVariables = Exact<{ [key: string]: never; }>;


export type LevelScalesDetailedQuery = { readonly levelScales: ReadonlyArray<{ readonly id: string, readonly name: string, readonly isDefault: boolean, readonly levels: ReadonlyArray<{ readonly value: number, readonly title: string }>, readonly dimensionDescriptors: ReadonlyArray<{ readonly levelValue: number, readonly dimension: string, readonly description: string }> }> };

export type ScoringRulesListQueryVariables = Exact<{ [key: string]: never; }>;


export type ScoringRulesListQuery = { readonly scoringRules: ReadonlyArray<{ readonly id: string, readonly name: string, readonly isDefault: boolean, readonly confidenceThreshold: number }> };

export type SetDefaultScoringRuleMutationVariables = Exact<{
  id: string;
}>;


export type SetDefaultScoringRuleMutation = { readonly setDefaultScoringRule: { readonly id: string, readonly name: string, readonly isDefault: boolean, readonly confidenceThreshold: number } };

export type CreateLevelScaleMutationVariables = Exact<{
  input: NameInput;
}>;


export type CreateLevelScaleMutation = { readonly createLevelScale: { readonly id: string, readonly name: string } };

export type CreateScoringRuleOpMutationVariables = Exact<{
  input: ScoringRuleInput;
}>;


export type CreateScoringRuleOpMutation = { readonly createScoringRule: { readonly id: string, readonly name: string, readonly confidenceThreshold: number } };

export type UpsertLevelDimensionDescriptorMutationVariables = Exact<{
  input: LevelDimensionDescriptorInput;
}>;


export type UpsertLevelDimensionDescriptorMutation = { readonly upsertLevelDimensionDescriptor: { readonly id: string, readonly levelValue: number, readonly dimension: string, readonly description: string } };

export type MvpSliceQueryVariables = Exact<{ [key: string]: never; }>;


export type MvpSliceQuery = { readonly dashboard: { readonly activeCycleName: string, readonly ontologyDomains: number, readonly competencies: number, readonly matrixRequirements: number, readonly assessmentCoveragePercent: number, readonly criticalGaps: number }, readonly organization: { readonly name: string }, readonly ontology: { readonly categories: ReadonlyArray<{ readonly id: string, readonly name: string, readonly description: string, readonly categoryType: string, readonly sourceKind: string, readonly competencies: ReadonlyArray<{ readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> }> }> }, readonly roleProfile: { readonly name: string, readonly description: string, readonly role: { readonly name: string, readonly family: { readonly name: string } }, readonly grade: { readonly name: string }, readonly tasks: ReadonlyArray<{ readonly id: string, readonly name: string, readonly expectedOutcome: string, readonly criticality: string }> } | null, readonly matrix: { readonly name: string, readonly status: string, readonly activeRevision: { readonly version: number, readonly requirements: ReadonlyArray<{ readonly id: string, readonly targetLevel: number, readonly normalizedWeight: number, readonly criticality: string, readonly neededOnEntry: boolean, readonly competency: { readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> } }> } } | null, readonly assessment: { readonly id: string, readonly status: string, readonly person: { readonly fullName: string, readonly email: string }, readonly scores: ReadonlyArray<{ readonly id: string, readonly source: string, readonly level: number, readonly confidence: number, readonly verificationStatus: string, readonly comment: string, readonly competency: { readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> } }>, readonly gaps: ReadonlyArray<{ readonly targetLevel: number, readonly currentLevel: number, readonly gap: number, readonly weightedGap: number, readonly criticality: string, readonly competency: { readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> } }> } | null, readonly developmentPlan: { readonly items: ReadonlyArray<{ readonly id: string, readonly title: string, readonly gap: number, readonly dueDate: string, readonly status: string, readonly competency: { readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> } }> } | null };

export type OntologyAdminQueryVariables = Exact<{ [key: string]: never; }>;


export type OntologyAdminQuery = { readonly ontology: { readonly categories: ReadonlyArray<{ readonly id: string, readonly name: string, readonly description: string, readonly categoryType: string, readonly status: string, readonly competencies: ReadonlyArray<{ readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly validationStatus: string }> }> } };

export type CreateCompetencyCategoryMutationVariables = Exact<{
  input: CompetencyCategoryInput;
}>;


export type CreateCompetencyCategoryMutation = { readonly createCompetencyCategory: { readonly id: string, readonly name: string, readonly description: string, readonly categoryType: string } };

export type UpdateCompetencyCategoryMutationVariables = Exact<{
  input: UpdateCompetencyCategoryInput;
}>;


export type UpdateCompetencyCategoryMutation = { readonly updateCompetencyCategory: { readonly id: string, readonly name: string, readonly description: string, readonly categoryType: string } };

export type DeleteCompetencyCategoryMutationVariables = Exact<{
  id: string;
}>;


export type DeleteCompetencyCategoryMutation = { readonly deleteCompetencyCategory: boolean };

export type CreateCompetencyMutationVariables = Exact<{
  input: CompetencyInput;
}>;


export type CreateCompetencyMutation = { readonly createCompetency: { readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string> } };

export type UpdateCompetencyMutationVariables = Exact<{
  input: UpdateCompetencyInput;
}>;


export type UpdateCompetencyMutation = { readonly updateCompetency: { readonly id: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string> } };

export type DeleteCompetencyMutationVariables = Exact<{
  id: string;
}>;


export type DeleteCompetencyMutation = { readonly deleteCompetency: boolean };

export type PeopleAssignmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type PeopleAssignmentsQuery = { readonly currentActor: { readonly user: { readonly id: string, readonly email: string, readonly role: string }, readonly person: { readonly id: string, readonly fullName: string, readonly email: string, readonly currentAssignment: { readonly id: string, readonly status: string, readonly effectiveFrom: string, readonly effectiveTo: string | null, readonly orgUnit: { readonly id: string, readonly name: string, readonly type: string }, readonly manager: { readonly id: string, readonly fullName: string } | null, readonly roleProfile: { readonly id: string, readonly name: string } } | null } | null }, readonly orgUnits: ReadonlyArray<{ readonly id: string, readonly parentId: string | null, readonly type: string, readonly name: string, readonly status: string }>, readonly people: ReadonlyArray<{ readonly id: string, readonly fullName: string, readonly email: string, readonly currentAssignment: { readonly id: string, readonly status: string, readonly effectiveFrom: string, readonly orgUnit: { readonly id: string, readonly name: string, readonly type: string }, readonly manager: { readonly id: string, readonly fullName: string } | null, readonly roleProfile: { readonly id: string, readonly name: string } } | null }>, readonly calibrationSessions: ReadonlyArray<{ readonly id: string, readonly name: string, readonly status: string, readonly decisions: ReadonlyArray<{ readonly id: string, readonly originalLevel: number, readonly calibratedLevel: number, readonly diff: number, readonly reason: string, readonly score: { readonly id: string, readonly competency: { readonly id: string, readonly code: string, readonly name: string } } }> }>, readonly levelScales: ReadonlyArray<{ readonly id: string, readonly name: string, readonly isDefault: boolean, readonly status: string, readonly levels: ReadonlyArray<{ readonly value: number, readonly title: string, readonly description: string }>, readonly dimensionDescriptors: ReadonlyArray<{ readonly id: string, readonly levelValue: number, readonly dimension: string, readonly description: string }> }>, readonly scoringRules: ReadonlyArray<{ readonly id: string, readonly name: string, readonly confidenceThreshold: number, readonly isDefault: boolean, readonly status: string }>, readonly auditEvents: ReadonlyArray<{ readonly id: string, readonly action: string, readonly entityType: string, readonly entityId: string, readonly summary: string, readonly actorUserId: string | null, readonly createdAt: string }> };

export type DashboardSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardSummaryQuery = { readonly dashboard: { readonly activeCycleName: string, readonly competencies: number, readonly criticalGaps: number } };

export type CurrentActorDetailedQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentActorDetailedQuery = { readonly currentActor: { readonly user: { readonly id: string, readonly email: string, readonly role: string, readonly person: { readonly id: string, readonly fullName: string } | null }, readonly person: { readonly id: string, readonly fullName: string } | null } };

export type CurrentActorRoleQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentActorRoleQuery = { readonly currentActor: { readonly user: { readonly id: string, readonly role: string } } };

export type OrgUnitsListQueryVariables = Exact<{ [key: string]: never; }>;


export type OrgUnitsListQuery = { readonly orgUnits: ReadonlyArray<{ readonly id: string, readonly name: string, readonly type: string, readonly parentId: string | null }> };

export type PeopleListQueryVariables = Exact<{ [key: string]: never; }>;


export type PeopleListQuery = { readonly people: ReadonlyArray<{ readonly id: string, readonly fullName: string, readonly currentAssignment: { readonly roleProfile: { readonly name: string } } | null }> };

export type PersonByIdQueryVariables = Exact<{
  id: string;
}>;


export type PersonByIdQuery = { readonly person: { readonly id: string, readonly fullName: string, readonly email: string } | null };

export type CurrentAssignmentForPersonQueryVariables = Exact<{
  personId: string;
}>;


export type CurrentAssignmentForPersonQuery = { readonly currentAssignment: { readonly id: string, readonly status: string, readonly effectiveFrom: string, readonly orgUnit: { readonly id: string, readonly name: string }, readonly manager: { readonly id: string, readonly fullName: string } | null, readonly roleProfile: { readonly id: string, readonly name: string } } | null };

export type DirectReportsQueryVariables = Exact<{
  managerPersonId: string;
}>;


export type DirectReportsQuery = { readonly directReports: ReadonlyArray<{ readonly person: { readonly id: string, readonly fullName: string } }> };

export type CreatePersonMutationVariables = Exact<{
  input: CreatePersonInput;
}>;


export type CreatePersonMutation = { readonly createPerson: { readonly id: string, readonly fullName: string, readonly email: string, readonly status: string } };

export type ArchiveAssignmentMutationVariables = Exact<{
  id: string;
}>;


export type ArchiveAssignmentMutation = { readonly archiveAssignment: { readonly id: string, readonly status: string } };

export type CreateOrgUnitOpMutationVariables = Exact<{
  input: OrgUnitInput;
}>;


export type CreateOrgUnitOpMutation = { readonly createOrgUnit: { readonly id: string, readonly name: string, readonly type: string, readonly parentId: string | null } };

export type CreateAssignmentOpMutationVariables = Exact<{
  input: CreateAssignmentInput;
}>;


export type CreateAssignmentOpMutation = { readonly createAssignment: { readonly id: string, readonly status: string, readonly person: { readonly id: string }, readonly orgUnit: { readonly id: string } } };

export type UpdatePersonOpMutationVariables = Exact<{
  input: UpdatePersonInput;
}>;


export type UpdatePersonOpMutation = { readonly updatePerson: { readonly id: string, readonly fullName: string, readonly email: string, readonly status: string } };

export type RolesAdminQueryVariables = Exact<{ [key: string]: never; }>;


export type RolesAdminQuery = { readonly roleFamilies: ReadonlyArray<{ readonly id: string, readonly name: string }>, readonly roles: ReadonlyArray<{ readonly id: string, readonly name: string, readonly family: { readonly id: string, readonly name: string } }>, readonly grades: ReadonlyArray<{ readonly id: string, readonly name: string, readonly rank: number }>, readonly roleProfiles: ReadonlyArray<{ readonly id: string, readonly name: string, readonly description: string, readonly role: { readonly id: string, readonly name: string, readonly family: { readonly id: string, readonly name: string } }, readonly grade: { readonly id: string, readonly name: string, readonly rank: number }, readonly tasks: ReadonlyArray<{ readonly id: string, readonly name: string, readonly expectedOutcome: string, readonly criticality: string }> }> };

export type CreateRoleFamilyMutationVariables = Exact<{
  input: NameInput;
}>;


export type CreateRoleFamilyMutation = { readonly createRoleFamily: { readonly id: string, readonly name: string } };

export type CreateRoleMutationVariables = Exact<{
  input: RoleInput;
}>;


export type CreateRoleMutation = { readonly createRole: { readonly id: string, readonly name: string } };

export type CreateGradeMutationVariables = Exact<{
  input: GradeInput;
}>;


export type CreateGradeMutation = { readonly createGrade: { readonly id: string, readonly name: string, readonly rank: number } };

export type CreateRoleProfileMutationVariables = Exact<{
  input: RoleProfileInput;
}>;


export type CreateRoleProfileMutation = { readonly createRoleProfile: { readonly id: string, readonly name: string } };

export type CreateRoleTaskMutationVariables = Exact<{
  input: RoleTaskInput;
}>;


export type CreateRoleTaskMutation = { readonly createRoleTask: { readonly id: string, readonly name: string } };

export type DeleteRoleTaskMutationVariables = Exact<{
  id: string;
}>;


export type DeleteRoleTaskMutation = { readonly deleteRoleTask: boolean };


export const ManagerDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ManagerDashboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"managerPersonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"managerDashboard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"managerPersonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"managerPersonId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"managerPersonId"}},{"kind":"Field","name":{"kind":"Name","value":"reports"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personId"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"hasAssessment"}},{"kind":"Field","name":{"kind":"Name","value":"gapCount"}},{"kind":"Field","name":{"kind":"Name","value":"criticalGapCount"}}]}}]}}]}}]} as unknown as DocumentNode<ManagerDashboardQuery, ManagerDashboardQueryVariables>;
export const OrganizationGapSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationGapSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationGapSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assessedPeople"}},{"kind":"Field","name":{"kind":"Name","value":"totalPeople"}},{"kind":"Field","name":{"kind":"Name","value":"coveragePercent"}},{"kind":"Field","name":{"kind":"Name","value":"criticalGapCount"}},{"kind":"Field","name":{"kind":"Name","value":"byCompetency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"competencyName"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}},{"kind":"Field","name":{"kind":"Name","value":"avgGap"}},{"kind":"Field","name":{"kind":"Name","value":"isCritical"}}]}}]}}]}}]} as unknown as DocumentNode<OrganizationGapSummaryQuery, OrganizationGapSummaryQueryVariables>;
export const OrganizationCoverageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationCoverage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizationGapSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"coveragePercent"}}]}}]}}]} as unknown as DocumentNode<OrganizationCoverageQuery, OrganizationCoverageQueryVariables>;
export const AssessmentsAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssessmentsAdmin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"people"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roleProfiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"matrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"activeRevision"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"assessments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roleProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"competencies"},"name":{"kind":"Name","value":"ontology"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"competencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AssessmentsAdminQuery, AssessmentsAdminQueryVariables>;
export const CreateAssessmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAssessment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAssessmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAssessment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateAssessmentMutation, CreateAssessmentMutationVariables>;
export const UpsertAssessmentScoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertAssessmentScore"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AssessmentScoreInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertAssessmentScore"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}}]} as unknown as DocumentNode<UpsertAssessmentScoreMutation, UpsertAssessmentScoreMutationVariables>;
export const FinalizeAssessmentAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinalizeAssessmentAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeAssessment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<FinalizeAssessmentAdminMutation, FinalizeAssessmentAdminMutationVariables>;
export const AuditEventsRecentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditEventsRecent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"actorUserId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AuditEventsRecentQuery, AuditEventsRecentQueryVariables>;
export const AuditEventsForEntityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuditEventsForEntity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entityType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entityId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"auditEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"entityType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entityType"}}},{"kind":"Argument","name":{"kind":"Name","value":"entityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entityId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"action"}}]}}]}}]} as unknown as DocumentNode<AuditEventsForEntityQuery, AuditEventsForEntityQueryVariables>;
export const FinalizeAssessmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FinalizeAssessment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"finalizeAssessment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<FinalizeAssessmentMutation, FinalizeAssessmentMutationVariables>;
export const ActivateMatrixDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ActivateMatrix"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activateMatrix"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ActivateMatrixMutation, ActivateMatrixMutationVariables>;
export const CalibrationSessionsDetailedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CalibrationSessionsDetailed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"calibrationSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"decisions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"originalLevel"}},{"kind":"Field","name":{"kind":"Name","value":"calibratedLevel"}},{"kind":"Field","name":{"kind":"Name","value":"diff"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"score"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"assessments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}}]}}]} as unknown as DocumentNode<CalibrationSessionsDetailedQuery, CalibrationSessionsDetailedQueryVariables>;
export const CreateCalibrationSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCalibrationSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCalibrationSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateCalibrationSessionMutation, CreateCalibrationSessionMutationVariables>;
export const CloseCalibrationSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CloseCalibrationSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"closeCalibrationSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CloseCalibrationSessionMutation, CloseCalibrationSessionMutationVariables>;
export const AddCalibrationDecisionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddCalibrationDecision"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CalibrationDecisionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addCalibrationDecision"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"calibratedLevel"}}]}}]}}]} as unknown as DocumentNode<AddCalibrationDecisionMutation, AddCalibrationDecisionMutationVariables>;
export const DeleteCalibrationDecisionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCalibrationDecision"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCalibrationDecision"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCalibrationDecisionMutation, DeleteCalibrationDecisionMutationVariables>;
export const DevelopmentAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DevelopmentAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assessmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"developmentPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assessmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assessmentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assessment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"assessments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]} as unknown as DocumentNode<DevelopmentAdminQuery, DevelopmentAdminQueryVariables>;
export const UpdateDevelopmentPlanItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDevelopmentPlanItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateDevelopmentPlanItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDevelopmentPlanItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}}]}}]}}]} as unknown as DocumentNode<UpdateDevelopmentPlanItemMutation, UpdateDevelopmentPlanItemMutationVariables>;
export const ExportMatrixAndGapsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExportMatrixAndGaps"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"matrixRevisionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assessmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportMatrixRequirements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"matrixRevisionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"matrixRevisionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"competencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"competencyName"}},{"kind":"Field","name":{"kind":"Name","value":"targetLevel"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}}]}},{"kind":"Field","name":{"kind":"Name","value":"exportGapSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assessmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assessmentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"competencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"weightedGap"}}]}}]}}]} as unknown as DocumentNode<ExportMatrixAndGapsQuery, ExportMatrixAndGapsQueryVariables>;
export const ImportCompetenciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ImportCompetencies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompetencyImportInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importCompetencies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applied"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"rowCount"}},{"kind":"Field","name":{"kind":"Name","value":"categoriesParsed"}},{"kind":"Field","name":{"kind":"Name","value":"competenciesParsed"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"row"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<ImportCompetenciesMutation, ImportCompetenciesMutationVariables>;
export const MatricesAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MatricesAdmin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roleProfiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"matrices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"roleProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"activeRevision"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"targetLevel"}},{"kind":"Field","name":{"kind":"Name","value":"normalizedWeight"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}},{"kind":"Field","name":{"kind":"Name","value":"neededOnEntry"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"competencies"},"name":{"kind":"Name","value":"ontology"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"competencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<MatricesAdminQuery, MatricesAdminQueryVariables>;
export const CreateMatrixDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMatrix"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MatrixInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMatrix"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateMatrixMutation, CreateMatrixMutationVariables>;
export const UpsertMatrixRequirementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertMatrixRequirement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MatrixRequirementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertMatrixRequirement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"targetLevel"}},{"kind":"Field","name":{"kind":"Name","value":"normalizedWeight"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}}]}}]}}]} as unknown as DocumentNode<UpsertMatrixRequirementMutation, UpsertMatrixRequirementMutationVariables>;
export const DeleteMatrixRequirementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMatrixRequirement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMatrixRequirement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMatrixRequirementMutation, DeleteMatrixRequirementMutationVariables>;
export const LevelScalesDetailedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LevelScalesDetailed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"levelScales"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"levels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensionDescriptors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"levelValue"}},{"kind":"Field","name":{"kind":"Name","value":"dimension"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<LevelScalesDetailedQuery, LevelScalesDetailedQueryVariables>;
export const ScoringRulesListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ScoringRulesList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scoringRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"confidenceThreshold"}}]}}]}}]} as unknown as DocumentNode<ScoringRulesListQuery, ScoringRulesListQueryVariables>;
export const SetDefaultScoringRuleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetDefaultScoringRule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setDefaultScoringRule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"confidenceThreshold"}}]}}]}}]} as unknown as DocumentNode<SetDefaultScoringRuleMutation, SetDefaultScoringRuleMutationVariables>;
export const CreateLevelScaleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateLevelScale"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createLevelScale"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateLevelScaleMutation, CreateLevelScaleMutationVariables>;
export const CreateScoringRuleOpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateScoringRuleOp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ScoringRuleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createScoringRule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"confidenceThreshold"}}]}}]}}]} as unknown as DocumentNode<CreateScoringRuleOpMutation, CreateScoringRuleOpMutationVariables>;
export const UpsertLevelDimensionDescriptorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertLevelDimensionDescriptor"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LevelDimensionDescriptorInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertLevelDimensionDescriptor"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"levelValue"}},{"kind":"Field","name":{"kind":"Name","value":"dimension"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<UpsertLevelDimensionDescriptorMutation, UpsertLevelDimensionDescriptorMutationVariables>;
export const MvpSliceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MvpSlice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeCycleName"}},{"kind":"Field","name":{"kind":"Name","value":"ontologyDomains"}},{"kind":"Field","name":{"kind":"Name","value":"competencies"}},{"kind":"Field","name":{"kind":"Name","value":"matrixRequirements"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentCoveragePercent"}},{"kind":"Field","name":{"kind":"Name","value":"criticalGaps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ontology"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryType"}},{"kind":"Field","name":{"kind":"Name","value":"sourceKind"}},{"kind":"Field","name":{"kind":"Name","value":"competencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"roleProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"profile-backend-go-senior","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"family"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"grade"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"expectedOutcome"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"matrix"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"matrix-backend-go-senior","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"activeRevision"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"targetLevel"}},{"kind":"Field","name":{"kind":"Name","value":"normalizedWeight"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}},{"kind":"Field","name":{"kind":"Name","value":"neededOnEntry"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"assessment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"assessment-alexey-backend-go-senior","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"gaps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"targetLevel"}},{"kind":"Field","name":{"kind":"Name","value":"currentLevel"}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"weightedGap"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"developmentPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assessmentId"},"value":{"kind":"StringValue","value":"assessment-alexey-backend-go-senior","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MvpSliceQuery, MvpSliceQueryVariables>;
export const OntologyAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OntologyAdmin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ontology"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"competencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"validationStatus"}}]}}]}}]}}]}}]} as unknown as DocumentNode<OntologyAdminQuery, OntologyAdminQueryVariables>;
export const CreateCompetencyCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCompetencyCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompetencyCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCompetencyCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryType"}}]}}]}}]} as unknown as DocumentNode<CreateCompetencyCategoryMutation, CreateCompetencyCategoryMutationVariables>;
export const UpdateCompetencyCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCompetencyCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCompetencyCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCompetencyCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryType"}}]}}]}}]} as unknown as DocumentNode<UpdateCompetencyCategoryMutation, UpdateCompetencyCategoryMutationVariables>;
export const DeleteCompetencyCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCompetencyCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCompetencyCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCompetencyCategoryMutation, DeleteCompetencyCategoryMutationVariables>;
export const CreateCompetencyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCompetency"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CompetencyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCompetency"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}}]}}]}}]} as unknown as DocumentNode<CreateCompetencyMutation, CreateCompetencyMutationVariables>;
export const UpdateCompetencyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCompetency"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCompetencyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCompetency"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}}]}}]}}]} as unknown as DocumentNode<UpdateCompetencyMutation, UpdateCompetencyMutationVariables>;
export const DeleteCompetencyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCompetency"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCompetency"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCompetencyMutation, DeleteCompetencyMutationVariables>;
export const PeopleAssignmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PeopleAssignments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"currentAssignment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveTo"}},{"kind":"Field","name":{"kind":"Name","value":"orgUnit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"manager"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roleProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"orgUnits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"people"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"currentAssignment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"orgUnit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"manager"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roleProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"calibrationSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"decisions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"originalLevel"}},{"kind":"Field","name":{"kind":"Name","value":"calibratedLevel"}},{"kind":"Field","name":{"kind":"Name","value":"diff"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"score"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"levelScales"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"levels"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensionDescriptors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"levelValue"}},{"kind":"Field","name":{"kind":"Name","value":"dimension"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scoringRules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"confidenceThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"auditEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"action"}},{"kind":"Field","name":{"kind":"Name","value":"entityType"}},{"kind":"Field","name":{"kind":"Name","value":"entityId"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"actorUserId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<PeopleAssignmentsQuery, PeopleAssignmentsQueryVariables>;
export const DashboardSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeCycleName"}},{"kind":"Field","name":{"kind":"Name","value":"competencies"}},{"kind":"Field","name":{"kind":"Name","value":"criticalGaps"}}]}}]}}]} as unknown as DocumentNode<DashboardSummaryQuery, DashboardSummaryQueryVariables>;
export const CurrentActorDetailedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentActorDetailed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]} as unknown as DocumentNode<CurrentActorDetailedQuery, CurrentActorDetailedQueryVariables>;
export const CurrentActorRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentActorRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentActor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<CurrentActorRoleQuery, CurrentActorRoleQueryVariables>;
export const OrgUnitsListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrgUnitsList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orgUnits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}}]}}]}}]} as unknown as DocumentNode<OrgUnitsListQuery, OrgUnitsListQueryVariables>;
export const PeopleListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PeopleList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"people"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"currentAssignment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roleProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PeopleListQuery, PeopleListQueryVariables>;
export const PersonByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PersonById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"person"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<PersonByIdQuery, PersonByIdQueryVariables>;
export const CurrentAssignmentForPersonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentAssignmentForPerson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"personId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentAssignment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"personId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"personId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"effectiveFrom"}},{"kind":"Field","name":{"kind":"Name","value":"orgUnit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"manager"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roleProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CurrentAssignmentForPersonQuery, CurrentAssignmentForPersonQueryVariables>;
export const DirectReportsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DirectReports"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"managerPersonId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"directReports"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"managerPersonId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"managerPersonId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]} as unknown as DocumentNode<DirectReportsQuery, DirectReportsQueryVariables>;
export const CreatePersonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePerson"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePersonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPerson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreatePersonMutation, CreatePersonMutationVariables>;
export const ArchiveAssignmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchiveAssignment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archiveAssignment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ArchiveAssignmentMutation, ArchiveAssignmentMutationVariables>;
export const CreateOrgUnitOpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrgUnitOp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrgUnitInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrgUnit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}}]}}]}}]} as unknown as DocumentNode<CreateOrgUnitOpMutation, CreateOrgUnitOpMutationVariables>;
export const CreateAssignmentOpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAssignmentOp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAssignmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAssignment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orgUnit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateAssignmentOpMutation, CreateAssignmentOpMutationVariables>;
export const UpdatePersonOpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePersonOp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePersonInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePerson"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UpdatePersonOpMutation, UpdatePersonOpMutationVariables>;
export const RolesAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RolesAdmin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roleFamilies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"family"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"grades"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rank"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roleProfiles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"family"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"grade"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rank"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"expectedOutcome"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}}]}}]}}]}}]} as unknown as DocumentNode<RolesAdminQuery, RolesAdminQueryVariables>;
export const CreateRoleFamilyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRoleFamily"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NameInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRoleFamily"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateRoleFamilyMutation, CreateRoleFamilyMutationVariables>;
export const CreateRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RoleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateRoleMutation, CreateRoleMutationVariables>;
export const CreateGradeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGrade"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GradeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGrade"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rank"}}]}}]}}]} as unknown as DocumentNode<CreateGradeMutation, CreateGradeMutationVariables>;
export const CreateRoleProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRoleProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RoleProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRoleProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateRoleProfileMutation, CreateRoleProfileMutationVariables>;
export const CreateRoleTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRoleTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RoleTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRoleTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateRoleTaskMutation, CreateRoleTaskMutationVariables>;
export const DeleteRoleTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteRoleTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteRoleTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteRoleTaskMutation, DeleteRoleTaskMutationVariables>;