import { describe, expect, it } from 'vitest';
import type { Assignment } from './types.js';
import { buildAssignmentSnapshot, currentAssignmentForPerson, directReportsOf } from './assignments.js';
import { mvpSeed } from './seed.js';

const baseDate = '2026-06-01';

function assignment(overrides: Partial<Assignment> & { id: string; personId: string }): Assignment {
  return {
    orgUnitId: 'unit-backend',
    roleProfileId: 'profile-backend-go-senior',
    effectiveFrom: baseDate,
    status: 'active',
    ...overrides,
  };
}

describe('currentAssignmentForPerson', () => {
  it('resolves the active assignment for the employee persona', () => {
    const current = currentAssignmentForPerson(mvpSeed.assignments, 'person-alexey');
    expect(current?.id).toBe('assignment-alexey');
    expect(current?.managerPersonId).toBe('person-marina');
  });

  it('skips archived assignments', () => {
    const assignments: Assignment[] = [
      assignment({ id: 'a1', personId: 'p1', status: 'archived' }),
    ];
    expect(currentAssignmentForPerson(assignments, 'p1')).toBeUndefined();
  });

  it('skips assignments that ended before the reference date', () => {
    const assignments: Assignment[] = [
      assignment({ id: 'a1', personId: 'p1', effectiveFrom: '2024-01-01', effectiveTo: '2024-12-31' }),
    ];
    expect(currentAssignmentForPerson(assignments, 'p1', new Date('2026-01-01'))).toBeUndefined();
  });

  it('skips assignments starting after the reference date', () => {
    const assignments: Assignment[] = [
      assignment({ id: 'a1', personId: 'p1', effectiveFrom: '2027-01-01' }),
    ];
    expect(currentAssignmentForPerson(assignments, 'p1', new Date('2026-01-01'))).toBeUndefined();
  });

  it('returns undefined for an unknown person', () => {
    expect(currentAssignmentForPerson(mvpSeed.assignments, 'nobody')).toBeUndefined();
  });
});

describe('directReportsOf', () => {
  it('lists active reports under the manager persona', () => {
    const reports = directReportsOf(mvpSeed.assignments, 'person-marina');
    expect(reports.map((r) => r.personId).sort()).toEqual(['person-alexey', 'person-expert']);
  });

  it('returns nothing for a person who manages no one', () => {
    expect(directReportsOf(mvpSeed.assignments, 'person-alexey')).toEqual([]);
  });
});

describe('buildAssignmentSnapshot', () => {
  it('captures the full assignment context', () => {
    const current = currentAssignmentForPerson(mvpSeed.assignments, 'person-alexey')!;
    const snapshot = buildAssignmentSnapshot(current);

    expect(snapshot).toEqual({
      assignmentId: 'assignment-alexey',
      personId: 'person-alexey',
      orgUnitId: 'unit-backend',
      managerPersonId: 'person-marina',
      roleProfileId: 'profile-backend-go-senior',
      effectiveFrom: current.effectiveFrom,
      effectiveTo: current.effectiveTo,
      status: 'active',
    });
  });
});
