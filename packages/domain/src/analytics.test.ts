import { describe, expect, it } from 'vitest';
import { managerTeamCoverage, organizationGapSummary } from './analytics.js';
import { mvpSeed } from './seed.js';

describe('managerTeamCoverage', () => {
  it('lists the manager direct reports with completion and gap counts', () => {
    const coverage = managerTeamCoverage(mvpSeed, 'person-marina');

    expect(coverage.map((r) => r.personId).sort()).toEqual(['person-alexey', 'person-expert']);

    const alexey = coverage.find((r) => r.personId === 'person-alexey');
    expect(alexey?.hasAssessment).toBe(true);
    expect(alexey?.assessmentStatus).toBe('in_review');
    expect(alexey?.gapCount).toBeGreaterThan(0);

    const igor = coverage.find((r) => r.personId === 'person-expert');
    expect(igor?.hasAssessment).toBe(false);
    expect(igor?.gapCount).toBe(0);
  });

  it('returns nothing for a non-manager', () => {
    expect(managerTeamCoverage(mvpSeed, 'person-alexey')).toEqual([]);
  });
});

describe('organizationGapSummary', () => {
  it('aggregates per-competency gaps and flags critical ones', () => {
    const summary = organizationGapSummary(mvpSeed);

    expect(summary.assessedPeople).toBeGreaterThan(0);
    expect(summary.totalPeople).toBeGreaterThanOrEqual(summary.assessedPeople);
    expect(summary.coveragePercent).toBeGreaterThan(0);
    expect(summary.byCompetency.length).toBeGreaterThan(0);

    const critical = summary.byCompetency.find((row) => row.isCritical);
    expect(critical?.criticality).toBe('high');

    const first = summary.byCompetency[0];
    expect(first.competencyName).toBeTruthy();
    expect(first.avgGap).toBeGreaterThanOrEqual(0);
  });

  it('sorts critical gaps first then by average gap descending', () => {
    const summary = organizationGapSummary(mvpSeed);
    const criticalFlags = summary.byCompetency.map((row) => Number(row.isCritical));
    const sortedCopy = [...criticalFlags].sort((a, b) => b - a);
    expect(criticalFlags).toEqual(sortedCopy);
  });
});
