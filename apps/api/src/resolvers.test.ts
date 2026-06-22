import { describe, expect, it, beforeEach } from 'vitest';
import { createYoga } from 'graphql-yoga';
import { print } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import {
  ArchiveAssignmentDocument,
  ActivateMatrixDocument,
  AuditEventsForEntityDocument,
  AuditEventsRecentDocument,
  CalibrationSessionsDetailedDocument,
  CreatePersonDocument,
  CurrentActorDetailedDocument,
  CurrentActorRoleDocument,
  CurrentAssignmentForPersonDocument,
  DashboardSummaryDocument,
  DirectReportsDocument,
  ExportMatrixAndGapsDocument,
  FinalizeAssessmentDocument,
  ImportCompetenciesDocument,
  LevelScalesDetailedDocument,
  ManagerDashboardDocument,
  OrganizationCoverageDocument,
  OrganizationGapSummaryDocument,
  OrgUnitsListDocument,
  PeopleListDocument,
  PersonByIdDocument,
  ScoringRulesListDocument,
  SetDefaultScoringRuleDocument,
} from '@comatrix/api-contracts';
import { mvpSeed } from '@comatrix/domain';
import { createComatrixContext, createExecutableSchema } from './resolvers.js';

function makeYoga() {
  return createYoga({ schema: createExecutableSchema(structuredClone(mvpSeed)), context: createComatrixContext() });
}

let instance: ReturnType<typeof makeYoga>;

beforeEach(() => {
  instance = makeYoga();
});

interface GraphQlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function run<TData, TVars>(
  document: TypedDocumentNode<TData, TVars>,
  variables?: TVars,
  headers: Record<string, string> = {},
): Promise<GraphQlResponse<TData>> {
  const response = await instance.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ query: print(document), variables }),
  });
  return (await response.json()) as GraphQlResponse<TData>;
}

const HR = 'user-daria';
const METHOD = 'user-elena';
const MANAGER = 'user-marina';
const EMPLOYEE = 'user-alexey';
function as(userId: string) {
  return { 'x-comatrix-user-id': userId };
}

describe('GraphQL API schema', () => {
  it('returns the MVP dashboard', async () => {
    const json = await run(DashboardSummaryDocument);

    expect(json.errors).toBeUndefined();
    expect(json.data?.dashboard.activeCycleName).toContain('Backend Go Senior');
    expect(json.data?.dashboard.competencies).toBeGreaterThan(10);
  });

  it('resolves currentActor to the default dev user with a bound person', async () => {
    const json = await run(CurrentActorDetailedDocument);

    expect(json.errors).toBeUndefined();
    expect(json.data?.currentActor.user.id).toBe('user-alexey');
    expect(json.data?.currentActor.user.role).toBe('employee');
    expect(json.data?.currentActor.user.person?.id).toBe('person-alexey');
    expect(json.data?.currentActor.person?.id).toBe('person-alexey');
  });

  it('respects the x-comatrix-user-id header for currentActor', async () => {
    const json = await run(CurrentActorRoleDocument, undefined, as(MANAGER));

    expect(json.errors).toBeUndefined();
    expect(json.data?.currentActor.user.id).toBe('user-marina');
    expect(json.data?.currentActor.user.role).toBe('manager');
  });
});

describe('people and assignment operations', () => {
  it('exposes org units for the actor organization', async () => {
    const json = await run(OrgUnitsListDocument);

    expect(json.errors).toBeUndefined();
    expect(json.data?.orgUnits.map((u) => u.id).sort()).toEqual(['unit-backend', 'unit-platform', 'unit-sre']);
  });

  it('lists people scoped to the actor organization', async () => {
    const json = await run(PeopleListDocument);

    expect(json.errors).toBeUndefined();
    expect(json.data?.people.length).toBeGreaterThanOrEqual(5);
    const alexey = json.data?.people.find((person) => person.id === 'person-alexey');
    expect(alexey?.currentAssignment?.roleProfile.name).toBe('Backend Go Engineer / Senior');
  });

  it('resolves a person by id within the same org', async () => {
    const json = await run(PersonByIdDocument, { id: 'person-alexey' });

    expect(json.errors).toBeUndefined();
    expect(json.data?.person?.fullName).toBe('Alexey Morozov');
  });

  it('resolves the current assignment for a person with manager and org unit', async () => {
    const json = await run(CurrentAssignmentForPersonDocument, { personId: 'person-alexey' });

    expect(json.errors).toBeUndefined();
    const assignment = json.data?.currentAssignment;
    expect(assignment?.status).toBe('active');
    expect(assignment?.orgUnit.id).toBe('unit-backend');
    expect(assignment?.manager?.fullName).toBe('Marina Volkova');
    expect(assignment?.roleProfile.id).toBe('profile-backend-go-senior');
  });

  it('resolves direct reports for the manager persona', async () => {
    const json = await run(DirectReportsDocument, { managerPersonId: 'person-marina' });

    expect(json.errors).toBeUndefined();
    expect(json.data?.directReports.map((report) => report.person.id).sort()).toEqual(['person-alexey', 'person-expert']);
  });

  it('creates a person via mutation and reads it back', async () => {
    const created = await run(CreatePersonDocument, { input: { fullName: 'Test Person', email: 'test.person@example.test' } }, as(METHOD));

    expect(created.errors).toBeUndefined();
    expect(created.data?.createPerson.email).toBe('test.person@example.test');

    const read = await run(PersonByIdDocument, { id: created.data!.createPerson.id });
    expect(read.data?.person?.email).toBe('test.person@example.test');
  });

  it('archives an assignment via mutation', async () => {
    const result = await run(ArchiveAssignmentDocument, { id: 'assignment-alexey' }, as(HR));

    expect(result.errors).toBeUndefined();
    expect(result.data?.archiveAssignment.status).toBe('archived');
  });
});

describe('calibration', () => {
  it('exposes calibration sessions with decisions preserving the original level', async () => {
    const json = await run(CalibrationSessionsDetailedDocument);

    expect(json.errors).toBeUndefined();
    const sessions = json.data?.calibrationSessions ?? [];
    expect(sessions).toHaveLength(1);
    const session = sessions[0];
    expect(session.name).toContain('pilot');
    expect(session.decisions.length).toBeGreaterThanOrEqual(1);
    const decision = session.decisions[0];
    expect(decision.originalLevel).not.toBe(decision.calibratedLevel);
    expect(decision.diff).toBe(decision.calibratedLevel - decision.originalLevel);
    expect(decision.score.competency.name).toBeTruthy();
  });
});

describe('methodology', () => {
  it('exposes a configurable level scale with definitions and dimension descriptors', async () => {
    const json = await run(LevelScalesDetailedDocument);

    expect(json.errors).toBeUndefined();
    const scales = json.data?.levelScales ?? [];
    expect(scales).toHaveLength(1);
    const scale = scales[0];
    expect(scale.isDefault).toBe(true);
    expect(scale.levels.length).toBeGreaterThanOrEqual(5);
    expect(scale.dimensionDescriptors.length).toBeGreaterThan(0);
    expect(scale.dimensionDescriptors[0].dimension).toBeTruthy();
  });

  it('exposes scoring rules and switches the default via mutation', async () => {
    const list = await run(ScoringRulesListDocument);
    expect(list.errors).toBeUndefined();
    expect(list.data?.scoringRules.length).toBeGreaterThanOrEqual(1);
    expect(list.data?.scoringRules.find((rule) => rule.isDefault)).toBeTruthy();

    const result = await run(SetDefaultScoringRuleDocument, { id: 'scoring-default' }, as(METHOD));
    expect(result.errors).toBeUndefined();
    expect(result.data?.setDefaultScoringRule.isDefault).toBe(true);
  });
});

describe('analytics', () => {
  it('returns the manager dashboard for the seeded manager', async () => {
    const json = await run(ManagerDashboardDocument, { managerPersonId: 'person-marina' }, as(MANAGER));

    expect(json.errors).toBeUndefined();
    const reports = json.data?.managerDashboard?.reports ?? [];
    expect(reports.map((report) => report.personId).sort()).toEqual(['person-alexey', 'person-expert']);
    const alexey = reports.find((report) => report.personId === 'person-alexey');
    expect(alexey?.hasAssessment).toBe(true);
    expect(alexey?.gapCount).toBeGreaterThan(0);
  });

  it('returns the organization gap summary with coverage and critical gaps', async () => {
    const json = await run(OrganizationGapSummaryDocument, undefined, as(HR));

    expect(json.errors).toBeUndefined();
    expect(json.data?.organizationGapSummary.coveragePercent).toBeGreaterThan(0);
    expect(json.data?.organizationGapSummary.byCompetency.length).toBeGreaterThan(0);
  });
});

describe('import and export', () => {
  it('exports matrix requirements and gap summaries as readable rows', async () => {
    const json = await run(ExportMatrixAndGapsDocument, {
      matrixRevisionId: 'matrix-backend-go-senior-r1',
      assessmentId: 'assessment-alexey-backend-go-senior',
    });

    expect(json.errors).toBeUndefined();
    expect(json.data?.exportMatrixRequirements.length).toBeGreaterThan(0);
    expect(json.data?.exportGapSummary.length).toBeGreaterThan(0);
  });

  it('rejects an invalid competency import with actionable row errors and does not apply', async () => {
    const result = await run(
      ImportCompetenciesDocument,
      { input: [{ category: '', code: '', name: '' }] },
      as(METHOD),
    );

    expect(result.errors).toBeUndefined();
    const report = result.data?.importCompetencies;
    expect(report?.valid).toBe(false);
    expect(report?.applied).toBe(false);
    expect(report?.errors.length).toBeGreaterThan(0);
    expect(report?.errors[0].row).toBe(1);
  });

  it('validates and applies a valid competency import', async () => {
    const result = await run(
      ImportCompetenciesDocument,
      { input: [{ category: 'Cloud', code: 'IMP-1', name: 'Imported competency' }] },
      as(METHOD),
    );

    expect(result.errors).toBeUndefined();
    const report = result.data?.importCompetencies;
    expect(report?.valid).toBe(true);
    expect(report?.applied).toBe(true);
    expect(report?.categoriesParsed).toBe(1);
    expect(report?.competenciesParsed).toBe(1);
  });
});

describe('audit trail', () => {
  it('writes an audit event for every critical write mutation with actor and timestamp', async () => {
    await run(CreatePersonDocument, { input: { fullName: 'A', email: 'a@x.test' } }, as(METHOD));
    await run(ArchiveAssignmentDocument, { id: 'assignment-alexey' }, as(HR));
    await run(SetDefaultScoringRuleDocument, { id: 'scoring-default' }, as(METHOD));
    await run(FinalizeAssessmentDocument, { id: 'assessment-alexey-backend-go-senior' }, as(MANAGER));
    await run(ActivateMatrixDocument, { id: 'matrix-backend-go-senior' }, as(HR));

    const audit = await run(AuditEventsRecentDocument, { limit: 50 }, as(HR));
    expect(audit.errors).toBeUndefined();
    const events = audit.data?.auditEvents ?? [];
    const actions = events.map((event) => event.action);
    for (const expected of [
      'person_created',
      'assignment_archived',
      'scoring_rule_default_set',
      'assessment_finalized',
      'matrix_activated',
    ]) {
      expect(actions, `mutation must produce ${expected}`).toContain(expected);
    }
    for (const event of events) {
      expect(event.actorUserId).toBeTruthy();
      expect(event.createdAt).toBeTruthy();
    }
  });

  it('regression: finalizeAssessment produces an audit event for that assessment', async () => {
    const result = await run(FinalizeAssessmentDocument, { id: 'assessment-alexey-backend-go-senior' }, as(MANAGER));
    expect(result.errors).toBeUndefined();

    const audit = await run(
      AuditEventsForEntityDocument,
      { entityType: 'assessment', entityId: 'assessment-alexey-backend-go-senior' },
      as(HR),
    );
    expect((audit.data?.auditEvents ?? []).map((event) => event.action)).toContain('assessment_finalized');
  });
});

describe('RBAC', () => {
  it('denies methodology writes for an employee and allows them for a methodology admin', async () => {
    const denied = await run(SetDefaultScoringRuleDocument, { id: 'scoring-default' }, as(EMPLOYEE));
    expect(denied.errors?.length).toBeGreaterThan(0);
    expect(denied.errors?.[0]?.message).toMatch(/not allowed/i);

    const allowed = await run(SetDefaultScoringRuleDocument, { id: 'scoring-default' }, as(METHOD));
    expect(allowed.errors).toBeUndefined();
    expect(allowed.data?.setDefaultScoringRule.id).toBe('scoring-default');
  });

  it('denies person creation for an employee and allows it for HR', async () => {
    const denied = await run(CreatePersonDocument, { input: { fullName: 'X', email: 'x@x.test' } }, as(EMPLOYEE));
    expect(denied.errors?.length).toBeGreaterThan(0);
    expect(denied.errors?.[0]?.message).toMatch(/not allowed/i);

    const allowed = await run(CreatePersonDocument, { input: { fullName: 'Y', email: 'y@x.test' } }, as(HR));
    expect(allowed.errors).toBeUndefined();
    expect(allowed.data?.createPerson.id).toBeTruthy();
  });

  it('denies analytics reads for an employee and allows them for a manager', async () => {
    const denied = await run(OrganizationCoverageDocument, undefined, as(EMPLOYEE));
    expect(denied.errors?.length).toBeGreaterThan(0);
    expect(denied.errors?.[0]?.message).toMatch(/not allowed/i);

    const allowed = await run(OrganizationCoverageDocument, undefined, as(MANAGER));
    expect(allowed.errors).toBeUndefined();
    expect(typeof allowed.data?.organizationGapSummary.coveragePercent).toBe('number');
  });
});
