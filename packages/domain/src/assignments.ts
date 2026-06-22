import type { Assignment, AssignmentSnapshot } from './types.js';

/**
 * Returns the assignment active for `personId` at `at` (defaults to now). An
 * assignment is current when status is `active`, `effectiveFrom <= at` and
 * (`effectiveTo` is unset or `effectiveTo > at`). Returns `undefined` when the
 * person has no current assignment.
 */
export function currentAssignmentForPerson(
  assignments: Assignment[],
  personId: string,
  at: Date = new Date(),
): Assignment | undefined {
  const atMs = at.getTime();
  return assignments.find((assignment) => {
    if (assignment.personId !== personId) {
      return false;
    }
    if (assignment.status !== 'active') {
      return false;
    }
    const fromMs = new Date(assignment.effectiveFrom).getTime();
    if (fromMs > atMs) {
      return false;
    }
    if (assignment.effectiveTo && new Date(assignment.effectiveTo).getTime() <= atMs) {
      return false;
    }
    return true;
  });
}

/**
 * Returns the current assignments whose manager is `managerPersonId`. Useful for
 * manager/team dashboards deriving direct reports from assignment history.
 */
export function directReportsOf(
  assignments: Assignment[],
  managerPersonId: string,
  at: Date = new Date(),
): Assignment[] {
  return assignments.filter(
    (assignment) =>
      assignment.managerPersonId === managerPersonId &&
      assignment.status === 'active' &&
      currentAssignmentForPerson(assignments, assignment.personId, at)?.id === assignment.id,
  );
}

/**
 * Builds a serializable snapshot of an assignment so assessment records can
 * capture the organisational context (org unit, manager, role profile, dates)
 * at the time of assessment, independently of later assignment changes.
 */
export function buildAssignmentSnapshot(assignment: Assignment): AssignmentSnapshot {
  return {
    assignmentId: assignment.id,
    personId: assignment.personId,
    orgUnitId: assignment.orgUnitId,
    managerPersonId: assignment.managerPersonId,
    roleProfileId: assignment.roleProfileId,
    effectiveFrom: assignment.effectiveFrom,
    effectiveTo: assignment.effectiveTo,
    status: assignment.status,
  };
}
