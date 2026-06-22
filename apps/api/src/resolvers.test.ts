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
