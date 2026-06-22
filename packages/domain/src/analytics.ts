import { calculateGaps } from './assessment.js';
import { currentAssignmentForPerson, directReportsOf } from './assignments.js';
import type { Assessment, MvpSeed } from './types.js';

export interface ReportCoverage {
  personId: string;
  fullName: string;
  hasAssessment: boolean;
  assessmentStatus: string | null;
  gapCount: number;
  criticalGapCount: number;
}

export interface CompetencyGapSummary {
  competencyId: string;
  competencyName: string;
  criticality: 'low' | 'medium' | 'high';
  assessedPeople: number;
  totalGap: number;
  avgGap: number;
  isCritical: boolean;
}

export interface OrganizationGapSummary {
  byCompetency: CompetencyGapSummary[];
  assessedPeople: number;
  totalPeople: number;
  coveragePercent: number;
  criticalGapCount: number;
}

/**
 * Build per-report coverage + gap metrics for a manager's direct reports.
 * Uses assignment history to resolve the current team and matrix/assessment
 * data to compute completion and gap counts.
 */
export function managerTeamCoverage(seed: MvpSeed, managerPersonId: string): ReportCoverage[] {
  const reports = directReportsOf(seed.assignments, managerPersonId);
  return reports.map((assignment) => {
    const person = seed.people.find((item) => item.id === assignment.personId);
    const assessment = seed.assessments.find((item) => item.personId === assignment.personId);
    const gaps = assessment ? gapsForAssessment(seed, assessment.id) : [];
    const criticalGaps = gaps.filter((gap) => gap.gap > 0 && gap.criticality === 'high');
    return {
      personId: assignment.personId,
      fullName: person?.fullName ?? assignment.personId,
      hasAssessment: Boolean(assessment),
      assessmentStatus: assessment?.status ?? null,
      gapCount: gaps.filter((gap) => gap.gap > 0).length,
      criticalGapCount: criticalGaps.length,
    };
  });
}

/**
 * Aggregate competency-level gap summaries across all assessments in the seed.
 * Critical gaps are those with criticality `high` and a non-zero gap.
 */
export function organizationGapSummary(seed: MvpSeed): OrganizationGapSummary {
  const assessedPersonIds = new Set(seed.assessments.map((assessment) => assessment.personId));
  const totals = new Map<string, CompetencyGapSummary & { _sum: number }>();

  for (const competency of seed.competencies) {
    totals.set(competency.id, {
      competencyId: competency.id,
      competencyName: competency.name,
      criticality: criticalityFor(seed, competency.id),
      assessedPeople: 0,
      totalGap: 0,
      avgGap: 0,
      isCritical: false,
      _sum: 0,
    });
  }

  for (const assessment of seed.assessments) {
    const gaps = calculateGapsForAssessment(seed, assessment);
    for (const gap of gaps) {
      const entry = totals.get(gap.competencyId);
      if (!entry) {
        continue;
      }
      entry.assessedPeople += 1;
      entry.totalGap += gap.gap;
      entry._sum += 1;
      if (gap.gap > 0 && gap.criticality === 'high') {
        entry.isCritical = true;
      }
    }
  }

  const byCompetency: CompetencyGapSummary[] = [];
  for (const entry of totals.values()) {
    byCompetency.push({
      competencyId: entry.competencyId,
      competencyName: entry.competencyName,
      criticality: entry.criticality,
      assessedPeople: entry.assessedPeople,
      totalGap: entry.totalGap,
      avgGap: entry._sum > 0 ? Number((entry.totalGap / entry._sum).toFixed(2)) : 0,
      isCritical: entry.isCritical,
    });
  }

  const assessedPeople = assessedPersonIds.size;
  const totalPeople = seed.people.length;
  const coveragePercent = totalPeople > 0 ? Math.round((assessedPeople / totalPeople) * 100) : 0;
  const criticalGapCount = byCompetency.filter((item) => item.isCritical).length;

  return {
    byCompetency: byCompetency
      .filter((item) => item.assessedPeople > 0)
      .sort((a, b) => Number(b.isCritical) - Number(a.isCritical) || b.avgGap - a.avgGap),
    assessedPeople,
    totalPeople,
    coveragePercent,
    criticalGapCount,
  };
}

function gapsForAssessment(seed: MvpSeed, assessmentId: string) {
  const assessment = seed.assessments.find((item) => item.id === assessmentId);
  if (!assessment) {
    return [];
  }
  return calculateGapsForAssessment(seed, assessment);
}

function calculateGapsForAssessment(seed: MvpSeed, assessment: Assessment) {
  const revision = seed.matrixRevisions.find((item) => item.id === assessment.matrixRevisionId);
  if (!revision) {
    return [];
  }
  return calculateGaps(revision, assessment);
}

function criticalityFor(seed: MvpSeed, competencyId: string): 'low' | 'medium' | 'high' {
  for (const revision of seed.matrixRevisions) {
    const requirement = revision.requirements.find((item) => item.competencyId === competencyId);
    if (requirement) {
      return requirement.criticality;
    }
  }
  return 'medium';
}

export { currentAssignmentForPerson };
