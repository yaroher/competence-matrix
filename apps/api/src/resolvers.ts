import { schema } from '@comatrix/api-contracts';
import { calculateGaps, mvpSeed, type MvpSeed } from '@comatrix/domain';
import { createSchema } from 'graphql-yoga';

export function createExecutableSchema(seed: MvpSeed = mvpSeed) {
  function competencyById(id: string) {
    const competency = seed.competencies.find((item) => item.id === id);
    if (!competency) {
      throw new Error(`Unknown competency ${id}`);
    }
    return competency;
  }

  function personById(id: string) {
    const person = seed.people.find((item) => item.id === id);
    if (!person) {
      throw new Error(`Unknown person ${id}`);
    }
    return person;
  }

  function roleProfileById(id: string) {
    return seed.roleProfiles.find((item) => item.id === id) ?? null;
  }

  function matrixById(id: string) {
    return seed.matrices.find((item) => item.id === id) ?? null;
  }

  function assessmentById(id: string) {
    return seed.assessments.find((item) => item.id === id) ?? null;
  }

  return createSchema({
    typeDefs: schema,
    resolvers: {
      Query: {
        dashboard: () => seed.dashboard,
        organization: () => seed.organization,
        ontology: () => seed,
        roleProfile: (_parent, args: { id: string }) => roleProfileById(args.id),
        matrix: (_parent, args: { id: string }) => matrixById(args.id),
        assessment: (_parent, args: { id: string }) => assessmentById(args.id),
        developmentPlan: (_parent, args: { assessmentId: string }) =>
          seed.developmentPlans.find((plan) => plan.assessmentId === args.assessmentId) ?? null,
      },
      CompetencyCategory: {
        competencies: (category: { id: string }) =>
          seed.competencies.filter((competency) => competency.categoryId === category.id),
      },
      RoleProfile: {
        role: (profile: { roleId: string }) => seed.roles.find((role) => role.id === profile.roleId),
        grade: (profile: { gradeId: string }) => seed.grades.find((grade) => grade.id === profile.gradeId),
        tasks: (profile: { id: string }) => seed.roleTasks.filter((task) => task.roleProfileId === profile.id),
      },
      Role: {
        family: (role: { roleFamilyId: string }) => seed.roleFamilies.find((family) => family.id === role.roleFamilyId),
      },
      RoleTask: {
        competencyLinks: (task: { id: string }) => seed.taskCompetencyLinks.filter((link) => link.roleTaskId === task.id),
      },
      TaskCompetencyLink: {
        competency: (link: { competencyId: string }) => competencyById(link.competencyId),
      },
      Matrix: {
        roleProfile: (matrix: { roleProfileId: string }) => roleProfileById(matrix.roleProfileId),
        activeRevision: (matrix: { activeRevisionId: string }) =>
          seed.matrixRevisions.find((revision) => revision.id === matrix.activeRevisionId),
      },
      MatrixRequirement: {
        competency: (requirement: { competencyId: string }) => competencyById(requirement.competencyId),
      },
      Assessment: {
        person: (assessment: { personId: string }) => personById(assessment.personId),
        roleProfile: (assessment: { roleProfileId: string }) => roleProfileById(assessment.roleProfileId),
        gaps: (assessment: { matrixRevisionId: string; id: string }) => {
          const revision = seed.matrixRevisions.find((item) => item.id === assessment.matrixRevisionId);
          const fullAssessment = assessmentById(assessment.id);
          if (!revision || !fullAssessment) {
            return [];
          }
          return calculateGaps(revision, fullAssessment);
        },
      },
      AssessmentScore: {
        competency: (score: { competencyId: string }) => competencyById(score.competencyId),
      },
      Gap: {
        competency: (gap: { competencyId: string }) => competencyById(gap.competencyId),
      },
      DevelopmentPlan: {
        person: (plan: { personId: string }) => personById(plan.personId),
        assessment: (plan: { assessmentId: string }) => assessmentById(plan.assessmentId),
      },
      DevelopmentPlanItem: {
        competency: (item: { competencyId: string }) => competencyById(item.competencyId),
        owner: (item: { ownerPersonId: string }) => personById(item.ownerPersonId),
      },
    },
  });
}

export const executableSchema = createExecutableSchema();
