import { describe, expect, it } from 'vitest';
import { createYoga } from 'graphql-yoga';
import { createExecutableSchema } from './resolvers.js';

describe('GraphQL API schema', () => {
  it('returns the MVP dashboard', async () => {
    const yoga = createYoga({ schema: createExecutableSchema() });
    const response = await yoga.fetch('http://localhost/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: '{ dashboard { activeCycleName competencies criticalGaps } }',
      }),
    });

    const json = await response.json();

    expect(json.errors).toBeUndefined();
    expect(json.data.dashboard.activeCycleName).toContain('Backend Go Senior');
    expect(json.data.dashboard.competencies).toBeGreaterThan(10);
  });
});
