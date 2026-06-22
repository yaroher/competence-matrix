import { describe, expect, it, beforeEach } from 'vitest';
import { createYoga } from 'graphql-yoga';
import { mvpSeed } from '@comatrix/domain';
import { createComatrixContext, createExecutableSchema } from './resolvers.js';

function makeYoga() {
  return createYoga({ schema: createExecutableSchema(structuredClone(mvpSeed)), context: createComatrixContext() });
}

let instance: ReturnType<typeof makeYoga>;

beforeEach(() => {
  instance = makeYoga();
});

async function run(query: string, headers: Record<string, string> = {}) {
  const response = await instance.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ query }),
  });
  return (await response.json()) as { data?: any; errors?: any };
}

describe('GraphQL API schema', () => {
  it('returns the MVP dashboard', async () => {
    const json = await run('{ dashboard { activeCycleName competencies criticalGaps } }');

    expect(json.errors).toBeUndefined();
    expect(json.data.dashboard.activeCycleName).toContain('Backend Go Senior');
    expect(json.data.dashboard.competencies).toBeGreaterThan(10);
  });

  it('resolves currentActor to the default dev user with a bound person', async () => {
    const json = await run('{ currentActor { user { id email role person { id fullName } } person { id fullName } } }');

    expect(json.errors).toBeUndefined();
    expect(json.data.currentActor.user.id).toBe('user-alexey');
    expect(json.data.currentActor.user.role).toBe('employee');
    expect(json.data.currentActor.user.person.id).toBe('person-alexey');
    expect(json.data.currentActor.person.id).toBe('person-alexey');
  });

  it('respects the x-comatrix-user-id header for currentActor', async () => {
    const json = await run('{ currentActor { user { id role } } }', { 'x-comatrix-user-id': 'user-marina' });

    expect(json.errors).toBeUndefined();
    expect(json.data.currentActor.user.id).toBe('user-marina');
    expect(json.data.currentActor.user.role).toBe('manager');
  });
});

describe('people and assignment operations', () => {
  it('exposes org units for the actor organization', async () => {
    const json = await run('{ orgUnits { id name type parentId } }');

    expect(json.errors).toBeUndefined();
    expect(json.data.orgUnits.map((u: { id: string }) => u.id).sort()).toEqual([
      'unit-backend',
      'unit-platform',
      'unit-sre',
    ]);
  });

  it('lists people scoped to the actor organization', async () => {
    const json = await run('{ people { id fullName currentAssignment { roleProfile { name } } } }');

    expect(json.errors).toBeUndefined();
    const people: Array<{ id: string; currentAssignment: { roleProfile: { name: string } } | null }> = json.data.people;
    expect(people.length).toBeGreaterThanOrEqual(5);
    const alexey = people.find((person) => person.id === 'person-alexey');
    expect(alexey?.currentAssignment?.roleProfile.name).toBe('Backend Go Engineer / Senior');
  });

  it('resolves a person by id within the same org', async () => {
    const json = await run('{ person(id: "person-alexey") { id fullName email } }');

    expect(json.errors).toBeUndefined();
    expect(json.data.person.fullName).toBe('Alexey Morozov');
  });

  it('resolves the current assignment for a person with manager and org unit', async () => {
    const json = await run(
      '{ currentAssignment(personId: "person-alexey") { id status effectiveFrom orgUnit { id name } manager { id fullName } roleProfile { id name } } }',
    );

    expect(json.errors).toBeUndefined();
    const assignment = json.data.currentAssignment;
    expect(assignment.status).toBe('active');
    expect(assignment.orgUnit.id).toBe('unit-backend');
    expect(assignment.manager.fullName).toBe('Marina Volkova');
    expect(assignment.roleProfile.id).toBe('profile-backend-go-senior');
  });

  it('resolves direct reports for the manager persona', async () => {
    const json = await run('{ directReports(managerPersonId: "person-marina") { person { id fullName } } }');

    expect(json.errors).toBeUndefined();
    expect(json.data.directReports.map((r: { person: { id: string } }) => r.person.id).sort()).toEqual([
      'person-alexey',
      'person-expert',
    ]);
  });

  it('creates a person via mutation and reads it back', async () => {
    const mutation =
      'mutation { createPerson(input: { fullName: "Test Person", email: "test.person@example.test" }) { id fullName email status } }';
    const created = await run(mutation);

    expect(created.errors).toBeUndefined();
    expect(created.data.createPerson.email).toBe('test.person@example.test');

    const read = await run(`{ person(id: "${created.data.createPerson.id}") { fullName email } }`);
    expect(read.data.person.email).toBe('test.person@example.test');
  });

  it('archives an assignment via mutation', async () => {
    const mutation = 'mutation { archiveAssignment(id: "assignment-alexey") { id status } }';
    const result = await run(mutation);

    expect(result.errors).toBeUndefined();
    expect(result.data.archiveAssignment.status).toBe('archived');
  });
});

describe('calibration', () => {
  it('exposes calibration sessions with decisions preserving the original level', async () => {
    const json = await run(
      '{ calibrationSessions { id name status decisions { id originalLevel calibratedLevel diff reason score { id competency { name } } } } }',
    );

    expect(json.errors).toBeUndefined();
    const sessions = json.data.calibrationSessions;
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
    const json = await run(
      '{ levelScales { id name isDefault levels { value title } dimensionDescriptors { levelValue dimension description } } }',
    );

    expect(json.errors).toBeUndefined();
    const scales = json.data.levelScales;
    expect(scales).toHaveLength(1);
    const scale = scales[0];
    expect(scale.isDefault).toBe(true);
    expect(scale.levels.length).toBeGreaterThanOrEqual(5);
    expect(scale.dimensionDescriptors.length).toBeGreaterThan(0);
    expect(scale.dimensionDescriptors[0].dimension).toBeTruthy();
  });

  it('exposes scoring rules and switches the default via mutation', async () => {
    const list = await run('{ scoringRules { id name isDefault confidenceThreshold } }');
    expect(list.errors).toBeUndefined();
    expect(list.data.scoringRules.length).toBeGreaterThanOrEqual(1);
    const before = list.data.scoringRules.find((r: { isDefault: boolean }) => r.isDefault);
    expect(before).toBeTruthy();

    const create = await run(
      'mutation { setDefaultScoringRule(id: "scoring-default") { id name isDefault confidenceThreshold } }',
    );
    expect(create.errors).toBeUndefined();
    expect(create.data.setDefaultScoringRule.isDefault).toBe(true);
  });
});

describe('analytics', () => {
  it('returns the manager dashboard for the seeded manager', async () => {
    const json = await run(
      '{ managerDashboard(managerPersonId: "person-marina") { managerPersonId reports { personId fullName hasAssessment gapCount criticalGapCount } } }',
    );

    expect(json.errors).toBeUndefined();
    const reports = json.data.managerDashboard.reports;
    expect(reports.map((r: { personId: string }) => r.personId).sort()).toEqual(['person-alexey', 'person-expert']);
    const alexey = reports.find((r: { personId: string }) => r.personId === 'person-alexey');
    expect(alexey.hasAssessment).toBe(true);
    expect(alexey.gapCount).toBeGreaterThan(0);
  });

  it('returns the organization gap summary with coverage and critical gaps', async () => {
    const json = await run(
      '{ organizationGapSummary { assessedPeople totalPeople coveragePercent criticalGapCount byCompetency { competencyName criticality avgGap isCritical } } }',
    );

    expect(json.errors).toBeUndefined();
    const summary = json.data.organizationGapSummary;
    expect(summary.coveragePercent).toBeGreaterThan(0);
    expect(summary.byCompetency.length).toBeGreaterThan(0);
  });
});

describe('import and export', () => {
  it('exports matrix requirements and gap summaries as readable rows', async () => {
    const matrix = await run(
      '{ exportMatrixRequirements(matrixRevisionId: "matrix-backend-go-senior-r1") { competencyCode competencyName targetLevel criticality } exportGapSummary(assessmentId: "assessment-alexey-backend-go-senior") { competencyCode gap weightedGap } }',
    );

    expect(matrix.errors).toBeUndefined();
    expect(matrix.data.exportMatrixRequirements.length).toBeGreaterThan(0);
    expect(matrix.data.exportGapSummary.length).toBeGreaterThan(0);
  });

  it('rejects an invalid competency import with actionable row errors and does not apply', async () => {
    const mutation =
      'mutation { importCompetencies(input: [{ category: "", code: "", name: "" }]) { applied valid rowCount errors { row field message } categoriesParsed competenciesParsed } }';
    const result = await run(mutation);

    expect(result.errors).toBeUndefined();
    const report = result.data.importCompetencies;
    expect(report.valid).toBe(false);
    expect(report.applied).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
    expect(report.errors[0].row).toBe(1);
  });

  it('validates and applies a valid competency import', async () => {
    const mutation =
      'mutation { importCompetencies(input: [{ category: "Cloud", code: "IMP-1", name: "Imported competency" }]) { applied valid rowCount categoriesParsed competenciesParsed errors { message } } }';
    const result = await run(mutation);

    expect(result.errors).toBeUndefined();
    const report = result.data.importCompetencies;
    expect(report.valid).toBe(true);
    expect(report.applied).toBe(true);
    expect(report.categoriesParsed).toBe(1);
    expect(report.competenciesParsed).toBe(1);
  });
});
