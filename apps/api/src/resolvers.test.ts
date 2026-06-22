import { describe, expect, it } from 'vitest';
import { createYoga } from 'graphql-yoga';
import { createComatrixContext, createExecutableSchema } from './resolvers.js';

function yoga() {
  return createYoga({ schema: createExecutableSchema(), context: createComatrixContext() });
}

async function run(query: string, headers: Record<string, string> = {}) {
  const response = await yoga().fetch('http://localhost/graphql', {
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
