import { describe, expect, it } from 'vitest';
import { calculateGaps } from './assessment.js';
import { mvpSeed } from './seed.js';

describe('calculateGaps', () => {
  it('keeps a non-negative gap per matrix requirement', () => {
    const revision = mvpSeed.matrixRevisions[0];
    const assessment = mvpSeed.assessments[0];

    const gaps = calculateGaps(revision, assessment);

    expect(gaps).toHaveLength(revision.requirements.length);
    expect(gaps.every((gap) => gap.gap >= 0)).toBe(true);
    expect(gaps.some((gap) => gap.gap > 0)).toBe(true);
  });
});

