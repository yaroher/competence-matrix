export type Id = string;

export type SourceKind =
  | 'system_seed'
  | 'organization_custom'
  | 'imported'
  | 'external_mapping';

export type ValidationStatus = 'draft' | 'reviewed' | 'validated';

export interface Organization {
  id: Id;
  name: string;
  status: 'active' | 'archived';
}

export interface OrgUnit {
  id: Id;
  organizationId: Id;
  parentId?: Id;
  type: 'company' | 'department' | 'team';
  name: string;
}

export interface Person {
  id: Id;
  organizationId: Id;
  fullName: string;
  email: string;
  status: 'active' | 'inactive';
}

export type SystemRole = 'employee' | 'manager' | 'expert' | 'hr' | 'methodology_admin';
export type UserStatus = 'active' | 'disabled';

export interface User {
  id: Id;
  organizationId: Id;
  personId?: Id;
  email: string;
  role: SystemRole;
  status: UserStatus;
}

export interface Assignment {
  id: Id;
  personId: Id;
  orgUnitId: Id;
  managerPersonId?: Id;
  roleProfileId: Id;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'active' | 'archived';
}

export interface AssignmentSnapshot {
  assignmentId: Id;
  personId: Id;
  orgUnitId: Id;
  managerPersonId?: Id;
  roleProfileId: Id;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'active' | 'archived';
}

export interface CompetencyCategory {
  id: Id;
  organizationId: Id;
  parentId?: Id;
  categoryType: string;
  name: string;
  description: string;
  sourceKind: SourceKind;
  sourceRef?: string;
  templateNodeId?: Id;
  sortOrder: number;
  status: 'active' | 'archived';
}

export interface Competency {
  id: Id;
  organizationId: Id;
  categoryId: Id;
  code: string;
  name: string;
  description: string;
  sourceKind: SourceKind;
  sourceRef?: string;
  templateCompetencyId?: Id;
  validationStatus: ValidationStatus;
  tags: string[];
  behavioralIndicators: BehavioralIndicator[];
}

export interface BehavioralIndicator {
  level: number;
  description: string;
}

export interface CompetencyRelation {
  id: Id;
  sourceCompetencyId: Id;
  targetCompetencyId: Id;
  relationType: 'similar_to' | 'prerequisite_for' | 'part_of' | 'replaces' | 'related_to';
  strength: number;
}

export interface LevelDefinition {
  value: number;
  title: string;
  description: string;
}

export interface RoleFamily {
  id: Id;
  organizationId: Id;
  name: string;
}

export interface Role {
  id: Id;
  roleFamilyId: Id;
  name: string;
}

export interface Grade {
  id: Id;
  organizationId: Id;
  name: string;
  rank: number;
}

export interface RoleProfile {
  id: Id;
  roleId: Id;
  gradeId: Id;
  name: string;
  description: string;
}

export interface RoleTask {
  id: Id;
  roleProfileId: Id;
  name: string;
  expectedOutcome: string;
  criticality: 'low' | 'medium' | 'high';
}

export interface TaskCompetencyLink {
  id: Id;
  roleTaskId: Id;
  competencyId: Id;
  criticality: 'low' | 'medium' | 'high';
  neededOnEntry: boolean;
}

export interface Matrix {
  id: Id;
  roleProfileId: Id;
  name: string;
  status: 'draft' | 'active' | 'archived';
  activeRevisionId: Id;
}

export interface MatrixRevision {
  id: Id;
  matrixId: Id;
  version: number;
  activatedAt: string;
  requirements: MatrixRequirement[];
}

export interface MatrixRequirement {
  id: Id;
  competencyId: Id;
  targetLevel: number;
  required: boolean;
  normalizedWeight: number;
  weightSource: 'equal' | 'job_analysis' | 'sme_review' | 'imported' | 'manual';
  criticality: 'low' | 'medium' | 'high';
  neededOnEntry: boolean;
  taskCompetencyLinkId?: Id;
}

export type AssessmentSource = 'self' | 'manager' | 'expert' | 'final';
export type VerificationStatus = 'unverified' | 'evidence_requested' | 'verified';

export interface AssessmentScore {
  id: Id;
  competencyId: Id;
  source: AssessmentSource;
  level: number;
  confidence: number;
  verificationStatus: VerificationStatus;
  comment: string;
}

export interface Assessment {
  id: Id;
  personId: Id;
  roleProfileId: Id;
  matrixRevisionId: Id;
  status: 'draft' | 'in_review' | 'finalized';
  scores: AssessmentScore[];
}

export interface Gap {
  competencyId: Id;
  targetLevel: number;
  currentLevel: number;
  gap: number;
  weightedGap: number;
  criticality: 'low' | 'medium' | 'high';
}

export interface DevelopmentPlanItem {
  id: Id;
  competencyId: Id;
  gap: number;
  title: string;
  ownerPersonId: Id;
  status: 'planned' | 'in_progress' | 'done';
  dueDate: string;
}

export interface DevelopmentPlan {
  id: Id;
  personId: Id;
  assessmentId: Id;
  items: DevelopmentPlanItem[];
}

export interface DashboardSummary {
  activeCycleName: string;
  ontologyDomains: number;
  competencies: number;
  matrixRequirements: number;
  assessmentCoveragePercent: number;
  criticalGaps: number;
}

export interface MvpSeed {
  organization: Organization;
  orgUnits: OrgUnit[];
  people: Person[];
  users: User[];
  assignments: Assignment[];
  categories: CompetencyCategory[];
  competencies: Competency[];
  relations: CompetencyRelation[];
  levels: LevelDefinition[];
  roleFamilies: RoleFamily[];
  roles: Role[];
  grades: Grade[];
  roleProfiles: RoleProfile[];
  roleTasks: RoleTask[];
  taskCompetencyLinks: TaskCompetencyLink[];
  matrices: Matrix[];
  matrixRevisions: MatrixRevision[];
  assessments: Assessment[];
  developmentPlans: DevelopmentPlan[];
  dashboard: DashboardSummary;
}

