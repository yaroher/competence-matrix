import 'dotenv/config';
import { mvpSeed } from '@comatrix/domain';
import { sql } from 'drizzle-orm';
import { createDb, createPool } from './client.js';
import {
  assessmentScores,
  assessments,
  assignments,
  auditEvents,
  calibrationDecisions,
  calibrationSessions,
  competencies,
  competencyCategories,
  competencyRelations,
  developmentPlanItems,
  developmentPlans,
  grades,
  levelDefinitions,
  levelDimensionDescriptors,
  levelScales,
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
  scoringRules,
  taskCompetencyLinks,
  users,
} from './schema.js';

function date(value: string) {
  return new Date(value);
}

async function main() {
  const pool = createPool();
  const db = createDb(pool);

  await db.execute(sql`
    truncate table
      audit_events,
      calibration_decisions,
      calibration_sessions,
      scoring_rules,
      level_dimension_descriptors,
      level_scales,
      assessment_scores,
      development_plan_items,
      development_plans,
      assessments,
      matrix_requirements,
      matrix_revisions,
      matrices,
      task_competency_links,
      role_tasks,
      competency_relations,
      competencies,
      competency_categories,
      assignments,
      role_profiles,
      grades,
      roles,
      role_families,
      users,
      people,
      org_units,
      level_definitions,
      organizations
    cascade
  `);

  await db.insert(organizations).values(mvpSeed.organization);
  await db.insert(levelScales).values(mvpSeed.levelScales);
  await db.insert(levelDefinitions).values(mvpSeed.levels);
  await db.insert(levelDimensionDescriptors).values(mvpSeed.levelDimensionDescriptors);
  await db.insert(scoringRules).values(
    mvpSeed.scoringRules.map((rule) => ({ ...rule, confidenceThreshold: String(rule.confidenceThreshold) })),
  );
  await db.insert(orgUnits).values(mvpSeed.orgUnits);
  await db.insert(people).values(mvpSeed.people);
  await db.insert(users).values(mvpSeed.users);
  await db.insert(roleFamilies).values(mvpSeed.roleFamilies);
  await db.insert(roles).values(mvpSeed.roles);
  await db.insert(grades).values(mvpSeed.grades);
  await db.insert(roleProfiles).values(mvpSeed.roleProfiles);
  await db.insert(assignments).values(
    mvpSeed.assignments.map((assignment) => ({
      ...assignment,
      effectiveFrom: date(assignment.effectiveFrom),
      effectiveTo: assignment.effectiveTo ? date(assignment.effectiveTo) : null,
    })),
  );
  await db.insert(competencyCategories).values(mvpSeed.categories);
  await db.insert(competencies).values(mvpSeed.competencies);
  await db.insert(competencyRelations).values(
    mvpSeed.relations.map((relation) => ({
      ...relation,
      strength: String(relation.strength),
    })),
  );
  await db.insert(roleTasks).values(mvpSeed.roleTasks);
  await db.insert(taskCompetencyLinks).values(mvpSeed.taskCompetencyLinks);
  await db.insert(matrices).values(mvpSeed.matrices);
  await db.insert(matrixRevisions).values(
    mvpSeed.matrixRevisions.map((revision) => ({
      id: revision.id,
      matrixId: revision.matrixId,
      version: revision.version,
      activatedAt: date(revision.activatedAt),
    })),
  );
  await db.insert(matrixRequirements).values(
    mvpSeed.matrixRevisions.flatMap((revision) =>
      revision.requirements.map((requirement) => ({
        ...requirement,
        matrixRevisionId: revision.id,
        normalizedWeight: String(requirement.normalizedWeight),
      })),
    ),
  );
  await db.insert(assessments).values(
    mvpSeed.assessments.map((assessment) => ({
      id: assessment.id,
      personId: assessment.personId,
      roleProfileId: assessment.roleProfileId,
      matrixRevisionId: assessment.matrixRevisionId,
      status: assessment.status,
    })),
  );
  await db.insert(assessmentScores).values(
    mvpSeed.assessments.flatMap((assessment) =>
      assessment.scores.map((score) => ({
        ...score,
        assessmentId: assessment.id,
        confidence: String(score.confidence),
      })),
    ),
  );
  await db.insert(developmentPlans).values(
    mvpSeed.developmentPlans.map((plan) => ({
      id: plan.id,
      personId: plan.personId,
      assessmentId: plan.assessmentId,
    })),
  );
  await db.insert(developmentPlanItems).values(
    mvpSeed.developmentPlans.flatMap((plan) =>
      plan.items.map((item) => ({
        ...item,
        developmentPlanId: plan.id,
        dueDate: date(item.dueDate),
      })),
    ),
  );
  await db.insert(calibrationSessions).values(mvpSeed.calibrationSessions);
  await db.insert(calibrationDecisions).values(mvpSeed.calibrationDecisions);
  await db.insert(auditEvents).values(
    mvpSeed.auditEvents.map((event) => ({ ...event, createdAt: date(event.createdAt) })),
  );

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
