import {
  assessmentScores,
  assessments,
  assignments,
  competencies,
  competencyCategories,
  competencyRelations,
  createDb,
  createPool,
  developmentPlanItems,
  developmentPlans,
  grades,
  levelDefinitions,
  matrices,
  matrixRequirements,
  matrixRevisions,
  organizations,
  orgUnits,
  people,
  roleFamilies,
  roleProfiles,
  roleTasks,
  roles,
  taskCompetencyLinks,
} from '@comatrix/db';
import { calculateGaps, mvpSeed } from '@comatrix/domain';
import type {
  Assessment,
  AssessmentScore,
  BehavioralIndicator,
  Competency,
  CompetencyCategory,
  DevelopmentPlan,
  DevelopmentPlanItem,
  MatrixRequirement,
  MatrixRevision,
  MvpSeed,
  Organization,
} from '@comatrix/domain';

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function one<T>(rows: T[], label: string): T {
  const item = rows[0];
  if (!item) {
    throw new Error(`PostgreSQL data source is missing ${label}`);
  }
  return item;
}

function isoDate(value: Date | null) {
  return value?.toISOString() ?? new Date(0).toISOString();
}

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function loadMvpSeedFromPostgres(connectionString?: string): Promise<MvpSeed> {
  const pool = createPool(connectionString);
  const db = createDb(pool);

  try {
    const [
      organizationRows,
      orgUnitRows,
      peopleRows,
      assignmentRows,
      categoryRows,
      competencyRows,
      relationRows,
      levelRows,
      roleFamilyRows,
      roleRows,
      gradeRows,
      roleProfileRows,
      roleTaskRows,
      taskCompetencyLinkRows,
      matrixRows,
      matrixRevisionRows,
      matrixRequirementRows,
      assessmentRows,
      assessmentScoreRows,
      developmentPlanRows,
      developmentPlanItemRows,
    ] = await Promise.all([
      db.select().from(organizations),
      db.select().from(orgUnits),
      db.select().from(people),
      db.select().from(assignments),
      db.select().from(competencyCategories),
      db.select().from(competencies),
      db.select().from(competencyRelations),
      db.select().from(levelDefinitions),
      db.select().from(roleFamilies),
      db.select().from(roles),
      db.select().from(grades),
      db.select().from(roleProfiles),
      db.select().from(roleTasks),
      db.select().from(taskCompetencyLinks),
      db.select().from(matrices),
      db.select().from(matrixRevisions),
      db.select().from(matrixRequirements),
      db.select().from(assessments),
      db.select().from(assessmentScores),
      db.select().from(developmentPlans),
      db.select().from(developmentPlanItems),
    ]);

    const categories: CompetencyCategory[] = categoryRows.map((category) => ({
      id: category.id,
      organizationId: category.organizationId,
      parentId: category.parentId ?? undefined,
      categoryType: category.categoryType,
      name: category.name,
      description: category.description,
      sourceKind: category.sourceKind,
      sourceRef: category.sourceRef ?? undefined,
      templateNodeId: category.templateNodeId ?? undefined,
      sortOrder: category.sortOrder,
      status: category.status as CompetencyCategory['status'],
    }));

    const competenciesData: Competency[] = competencyRows.map((competency) => ({
      ...competency,
      sourceRef: competency.sourceRef ?? undefined,
      templateCompetencyId: competency.templateCompetencyId ?? undefined,
      tags: asArray<string>(competency.tags),
      behavioralIndicators: asArray<BehavioralIndicator>(competency.behavioralIndicators),
    }));

    const requirementsByRevision = new Map<string, MatrixRequirement[]>();
    for (const requirement of matrixRequirementRows) {
      const list = requirementsByRevision.get(requirement.matrixRevisionId) ?? [];
      list.push({
        ...requirement,
        normalizedWeight: Number(requirement.normalizedWeight),
        weightSource: requirement.weightSource as MatrixRequirement['weightSource'],
        taskCompetencyLinkId: requirement.taskCompetencyLinkId ?? undefined,
      });
      requirementsByRevision.set(requirement.matrixRevisionId, list);
    }

    const matrixRevisionsData: MatrixRevision[] = matrixRevisionRows.map((revision) => ({
      ...revision,
      activatedAt: isoDate(revision.activatedAt),
      requirements: requirementsByRevision.get(revision.id) ?? [],
    }));

    const scoresByAssessment = new Map<string, AssessmentScore[]>();
    for (const score of assessmentScoreRows) {
      const list = scoresByAssessment.get(score.assessmentId) ?? [];
      list.push({
        id: score.id,
        competencyId: score.competencyId,
        source: score.source,
        level: score.level,
        confidence: Number(score.confidence),
        verificationStatus: score.verificationStatus as AssessmentScore['verificationStatus'],
        comment: score.comment,
      });
      scoresByAssessment.set(score.assessmentId, list);
    }

    const assessmentsData: Assessment[] = assessmentRows.map((assessment) => ({
      ...assessment,
      scores: scoresByAssessment.get(assessment.id) ?? [],
      status: assessment.status as Assessment['status'],
    }));

    const itemsByPlan = new Map<string, DevelopmentPlanItem[]>();
    for (const item of developmentPlanItemRows) {
      const list = itemsByPlan.get(item.developmentPlanId) ?? [];
      list.push({
        id: item.id,
        competencyId: item.competencyId,
        gap: item.gap,
        title: item.title,
        ownerPersonId: item.ownerPersonId,
        status: item.status as DevelopmentPlanItem['status'],
        dueDate: dateOnly(item.dueDate),
      });
      itemsByPlan.set(item.developmentPlanId, list);
    }

    const developmentPlansData: DevelopmentPlan[] = developmentPlanRows.map((plan) => ({
      ...plan,
      items: itemsByPlan.get(plan.id) ?? [],
    }));

    const activeRevision = matrixRevisionsData[0];
    const activeAssessment = assessmentsData[0];
    const gaps = activeRevision && activeAssessment ? calculateGaps(activeRevision, activeAssessment) : [];
    const activeRoleProfile = roleProfileRows[0];

    return {
      organization: {
        id: one(organizationRows, 'organization').id,
        name: one(organizationRows, 'organization').name,
        status: one(organizationRows, 'organization').status as Organization['status'],
      },
      orgUnits: orgUnitRows.map((unit) => ({
        ...unit,
        parentId: unit.parentId ?? undefined,
        type: unit.type as never,
      })),
      people: peopleRows.map((person) => ({ ...person, status: person.status as never })),
      assignments: assignmentRows.map((assignment) => ({
        ...assignment,
        managerPersonId: assignment.managerPersonId ?? undefined,
        effectiveFrom: dateOnly(assignment.effectiveFrom),
        effectiveTo: assignment.effectiveTo ? dateOnly(assignment.effectiveTo) : undefined,
      })),
      categories,
      competencies: competenciesData,
      relations: relationRows.map((relation) => ({
        ...relation,
        relationType: relation.relationType as never,
        strength: Number(relation.strength),
      })),
      levels: levelRows,
      roleFamilies: roleFamilyRows,
      roles: roleRows,
      grades: gradeRows,
      roleProfiles: roleProfileRows,
      roleTasks: roleTaskRows,
      taskCompetencyLinks: taskCompetencyLinkRows,
      matrices: matrixRows.map((matrix) => ({
        ...matrix,
        status: matrix.status as never,
        activeRevisionId: matrix.activeRevisionId ?? matrixRevisionsData.find((revision) => revision.matrixId === matrix.id)?.id ?? '',
      })),
      matrixRevisions: matrixRevisionsData,
      assessments: assessmentsData,
      developmentPlans: developmentPlansData,
      dashboard: {
        activeCycleName: `${activeRoleProfile?.name ?? 'v0.1'} pilot`,
        ontologyDomains: categoryRows.length,
        competencies: competencyRows.length,
        matrixRequirements: matrixRequirementRows.length,
        assessmentCoveragePercent: activeAssessment?.scores.length ? 100 : 0,
        criticalGaps: gaps.filter((gap) => gap.gap > 0 && gap.criticality === 'high').length,
      },
    };
  } finally {
    await pool.end();
  }
}

export async function loadMvpDataSource(source: 'seed' | 'postgres', connectionString?: string): Promise<MvpSeed> {
  if (source === 'postgres') {
    return loadMvpSeedFromPostgres(connectionString);
  }

  return mvpSeed;
}
