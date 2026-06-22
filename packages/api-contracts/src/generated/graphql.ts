/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Actor = {
  readonly __typename?: 'Actor';
  readonly person: Maybe<Person>;
  readonly user: User;
};

export type Assessment = {
  readonly __typename?: 'Assessment';
  readonly gaps: ReadonlyArray<Gap>;
  readonly id: Scalars['ID']['output'];
  readonly person: Person;
  readonly roleProfile: RoleProfile;
  readonly scores: ReadonlyArray<AssessmentScore>;
  readonly status: Scalars['String']['output'];
};

export type AssessmentScore = {
  readonly __typename?: 'AssessmentScore';
  readonly comment: Scalars['String']['output'];
  readonly competency: Competency;
  readonly confidence: Scalars['Float']['output'];
  readonly id: Scalars['ID']['output'];
  readonly level: Scalars['Int']['output'];
  readonly source: Scalars['String']['output'];
  readonly verificationStatus: Scalars['String']['output'];
};

export type BehavioralIndicator = {
  readonly __typename?: 'BehavioralIndicator';
  readonly description: Scalars['String']['output'];
  readonly level: Scalars['Int']['output'];
};

export type Competency = {
  readonly __typename?: 'Competency';
  readonly behavioralIndicators: ReadonlyArray<BehavioralIndicator>;
  readonly categoryId: Scalars['ID']['output'];
  readonly code: Scalars['String']['output'];
  readonly description: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly sourceKind: Scalars['String']['output'];
  readonly sourceRef: Maybe<Scalars['String']['output']>;
  readonly tags: ReadonlyArray<Scalars['String']['output']>;
  readonly validationStatus: Scalars['String']['output'];
};

export type CompetencyCategory = {
  readonly __typename?: 'CompetencyCategory';
  readonly categoryType: Scalars['String']['output'];
  readonly competencies: ReadonlyArray<Competency>;
  readonly description: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly parentId: Maybe<Scalars['ID']['output']>;
  readonly sortOrder: Scalars['Int']['output'];
  readonly sourceKind: Scalars['String']['output'];
  readonly sourceRef: Maybe<Scalars['String']['output']>;
  readonly status: Scalars['String']['output'];
};

export type CompetencyRelation = {
  readonly __typename?: 'CompetencyRelation';
  readonly id: Scalars['ID']['output'];
  readonly relationType: Scalars['String']['output'];
  readonly sourceCompetencyId: Scalars['ID']['output'];
  readonly strength: Scalars['Float']['output'];
  readonly targetCompetencyId: Scalars['ID']['output'];
};

export type DashboardSummary = {
  readonly __typename?: 'DashboardSummary';
  readonly activeCycleName: Scalars['String']['output'];
  readonly assessmentCoveragePercent: Scalars['Int']['output'];
  readonly competencies: Scalars['Int']['output'];
  readonly criticalGaps: Scalars['Int']['output'];
  readonly matrixRequirements: Scalars['Int']['output'];
  readonly ontologyDomains: Scalars['Int']['output'];
};

export type DevelopmentPlan = {
  readonly __typename?: 'DevelopmentPlan';
  readonly assessment: Assessment;
  readonly id: Scalars['ID']['output'];
  readonly items: ReadonlyArray<DevelopmentPlanItem>;
  readonly person: Person;
};

export type DevelopmentPlanItem = {
  readonly __typename?: 'DevelopmentPlanItem';
  readonly competency: Competency;
  readonly dueDate: Scalars['String']['output'];
  readonly gap: Scalars['Int']['output'];
  readonly id: Scalars['ID']['output'];
  readonly owner: Person;
  readonly status: Scalars['String']['output'];
  readonly title: Scalars['String']['output'];
};

export type Gap = {
  readonly __typename?: 'Gap';
  readonly competency: Competency;
  readonly criticality: Scalars['String']['output'];
  readonly currentLevel: Scalars['Int']['output'];
  readonly gap: Scalars['Int']['output'];
  readonly targetLevel: Scalars['Int']['output'];
  readonly weightedGap: Scalars['Float']['output'];
};

export type Grade = {
  readonly __typename?: 'Grade';
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly rank: Scalars['Int']['output'];
};

export type LevelDefinition = {
  readonly __typename?: 'LevelDefinition';
  readonly description: Scalars['String']['output'];
  readonly title: Scalars['String']['output'];
  readonly value: Scalars['Int']['output'];
};

export type Matrix = {
  readonly __typename?: 'Matrix';
  readonly activeRevision: MatrixRevision;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly roleProfile: RoleProfile;
  readonly status: Scalars['String']['output'];
};

export type MatrixRequirement = {
  readonly __typename?: 'MatrixRequirement';
  readonly competency: Competency;
  readonly criticality: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly neededOnEntry: Scalars['Boolean']['output'];
  readonly normalizedWeight: Scalars['Float']['output'];
  readonly required: Scalars['Boolean']['output'];
  readonly targetLevel: Scalars['Int']['output'];
  readonly weightSource: Scalars['String']['output'];
};

export type MatrixRevision = {
  readonly __typename?: 'MatrixRevision';
  readonly activatedAt: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly requirements: ReadonlyArray<MatrixRequirement>;
  readonly version: Scalars['Int']['output'];
};

export type Ontology = {
  readonly __typename?: 'Ontology';
  readonly categories: ReadonlyArray<CompetencyCategory>;
  readonly competencies: ReadonlyArray<Competency>;
  readonly levels: ReadonlyArray<LevelDefinition>;
  readonly relations: ReadonlyArray<CompetencyRelation>;
};

export type Organization = {
  readonly __typename?: 'Organization';
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly status: Scalars['String']['output'];
};

export type Person = {
  readonly __typename?: 'Person';
  readonly email: Scalars['String']['output'];
  readonly fullName: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly status: Scalars['String']['output'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly assessment: Maybe<Assessment>;
  readonly currentActor: Actor;
  readonly dashboard: DashboardSummary;
  readonly developmentPlan: Maybe<DevelopmentPlan>;
  readonly matrix: Maybe<Matrix>;
  readonly ontology: Ontology;
  readonly organization: Organization;
  readonly roleProfile: Maybe<RoleProfile>;
};


export type QueryAssessmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDevelopmentPlanArgs = {
  assessmentId: Scalars['ID']['input'];
};


export type QueryMatrixArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRoleProfileArgs = {
  id: Scalars['ID']['input'];
};

export type Role = {
  readonly __typename?: 'Role';
  readonly family: RoleFamily;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
};

export type RoleFamily = {
  readonly __typename?: 'RoleFamily';
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
};

export type RoleProfile = {
  readonly __typename?: 'RoleProfile';
  readonly description: Scalars['String']['output'];
  readonly grade: Grade;
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly role: Role;
  readonly tasks: ReadonlyArray<RoleTask>;
};

export type RoleTask = {
  readonly __typename?: 'RoleTask';
  readonly competencyLinks: ReadonlyArray<TaskCompetencyLink>;
  readonly criticality: Scalars['String']['output'];
  readonly expectedOutcome: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
};

export type TaskCompetencyLink = {
  readonly __typename?: 'TaskCompetencyLink';
  readonly competency: Competency;
  readonly criticality: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly neededOnEntry: Scalars['Boolean']['output'];
};

export type User = {
  readonly __typename?: 'User';
  readonly email: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly person: Maybe<Person>;
  readonly role: Scalars['String']['output'];
  readonly status: Scalars['String']['output'];
};

export type MvpSliceQueryVariables = Exact<{ [key: string]: never; }>;


export type MvpSliceQuery = { readonly dashboard: { readonly activeCycleName: string, readonly ontologyDomains: number, readonly competencies: number, readonly matrixRequirements: number, readonly assessmentCoveragePercent: number, readonly criticalGaps: number }, readonly organization: { readonly name: string }, readonly ontology: { readonly categories: ReadonlyArray<{ readonly id: string, readonly name: string, readonly description: string, readonly categoryType: string, readonly sourceKind: string, readonly competencies: ReadonlyArray<{ readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> }> }> }, readonly roleProfile: { readonly name: string, readonly description: string, readonly role: { readonly name: string, readonly family: { readonly name: string } }, readonly grade: { readonly name: string }, readonly tasks: ReadonlyArray<{ readonly id: string, readonly name: string, readonly expectedOutcome: string, readonly criticality: string }> } | null, readonly matrix: { readonly name: string, readonly status: string, readonly activeRevision: { readonly version: number, readonly requirements: ReadonlyArray<{ readonly id: string, readonly targetLevel: number, readonly normalizedWeight: number, readonly criticality: string, readonly neededOnEntry: boolean, readonly competency: { readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> } }> } } | null, readonly assessment: { readonly id: string, readonly status: string, readonly person: { readonly fullName: string, readonly email: string }, readonly scores: ReadonlyArray<{ readonly id: string, readonly source: string, readonly level: number, readonly confidence: number, readonly verificationStatus: string, readonly comment: string, readonly competency: { readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> } }>, readonly gaps: ReadonlyArray<{ readonly targetLevel: number, readonly currentLevel: number, readonly gap: number, readonly weightedGap: number, readonly criticality: string, readonly competency: { readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> } }> } | null, readonly developmentPlan: { readonly items: ReadonlyArray<{ readonly id: string, readonly title: string, readonly gap: number, readonly dueDate: string, readonly status: string, readonly competency: { readonly id: string, readonly code: string, readonly name: string, readonly description: string, readonly tags: ReadonlyArray<string>, readonly behavioralIndicators: ReadonlyArray<{ readonly level: number, readonly description: string }> } }> } | null };


export const MvpSliceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MvpSlice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeCycleName"}},{"kind":"Field","name":{"kind":"Name","value":"ontologyDomains"}},{"kind":"Field","name":{"kind":"Name","value":"competencies"}},{"kind":"Field","name":{"kind":"Name","value":"matrixRequirements"}},{"kind":"Field","name":{"kind":"Name","value":"assessmentCoveragePercent"}},{"kind":"Field","name":{"kind":"Name","value":"criticalGaps"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ontology"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"categoryType"}},{"kind":"Field","name":{"kind":"Name","value":"sourceKind"}},{"kind":"Field","name":{"kind":"Name","value":"competencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"roleProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"profile-backend-go-senior","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"role"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"family"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"grade"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"expectedOutcome"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"matrix"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"matrix-backend-go-senior","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"activeRevision"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"requirements"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"targetLevel"}},{"kind":"Field","name":{"kind":"Name","value":"normalizedWeight"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}},{"kind":"Field","name":{"kind":"Name","value":"neededOnEntry"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"assessment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"StringValue","value":"assessment-alexey-backend-go-senior","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"person"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"gaps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"targetLevel"}},{"kind":"Field","name":{"kind":"Name","value":"currentLevel"}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"weightedGap"}},{"kind":"Field","name":{"kind":"Name","value":"criticality"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"developmentPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assessmentId"},"value":{"kind":"StringValue","value":"assessment-alexey-backend-go-senior","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"gap"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"competency"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"behavioralIndicators"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MvpSliceQuery, MvpSliceQueryVariables>;