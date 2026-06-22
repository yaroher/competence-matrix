import type { Assessment, Gap, MatrixRevision } from './types.js';

export function finalLevelForCompetency(assessment: Assessment, competencyId: string): number {
  const finalScore = assessment.scores.find(
    (score) => score.competencyId === competencyId && score.source === 'final',
  );
  if (finalScore) {
    return finalScore.level;
  }

  const managerScore = assessment.scores.find(
    (score) => score.competencyId === competencyId && score.source === 'manager',
  );
  if (managerScore) {
    return managerScore.level;
  }

  return (
    assessment.scores.find((score) => score.competencyId === competencyId && score.source === 'self')?.level ?? 0
  );
}

export function calculateGaps(revision: MatrixRevision, assessment: Assessment): Gap[] {
  return revision.requirements.map((requirement) => {
    const currentLevel = finalLevelForCompetency(assessment, requirement.competencyId);
    const gap = Math.max(requirement.targetLevel - currentLevel, 0);

    return {
      competencyId: requirement.competencyId,
      targetLevel: requirement.targetLevel,
      currentLevel,
      gap,
      weightedGap: Number((gap * requirement.normalizedWeight).toFixed(2)),
      criticality: requirement.criticality,
    };
  });
}

