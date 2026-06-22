import { schema } from '@comatrix/api-contracts';
import { calculateGaps, currentAssignmentForPerson, directReportsOf, managerTeamCoverage, mvpSeed, organizationGapSummary, type MvpSeed } from '@comatrix/domain';
import { createSchema } from 'graphql-yoga';

export interface ComatrixContext {
  currentUserId: string;
}

export const DEFAULT_DEV_USER_ID = 'user-alexey';

export function createComatrixContext(initial?: Partial<ComatrixContext>) {
  return (ctx: { request?: { headers?: { get(name: string): string | null } } }): ComatrixContext => ({
    currentUserId:
      initial?.currentUserId ??
      ctx.request?.headers?.get('x-comatrix-user-id') ??
      DEFAULT_DEV_USER_ID,
  });
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

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

  function findPerson(id: string) {
    return seed.people.find((item) => item.id === id) ?? null;
  }

  function userById(id: string) {
    const user = seed.users.find((item) => item.id === id);
    if (!user) {
      throw new Error(`Unknown user ${id}`);
    }
    return user;
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

  function actorOrgId(ctx: ComatrixContext): string {
    const user = userById(ctx.currentUserId ?? DEFAULT_DEV_USER_ID);
    return user.organizationId;
  }

  function requireSameOrg(ctx: ComatrixContext, recordOrgId: string) {
    if (actorOrgId(ctx) !== recordOrgId) {
      throw new ForbiddenError('Cross-organization access is not allowed');
    }
  }

  return createSchema({
    typeDefs: schema,
    resolvers: {
      Query: {
        dashboard: () => seed.dashboard,
        organization: () => seed.organization,
        ontology: () => seed,
        currentActor: (_parent, _args, ctx: ComatrixContext) => {
          const userId = ctx?.currentUserId ?? DEFAULT_DEV_USER_ID;
          const user = userById(userId);
          const person = user.personId ? (seed.people.find((item) => item.id === user.personId) ?? null) : null;
          return { user, person };
        },
        orgUnits: (_parent, _args, ctx: ComatrixContext) => {
          const orgId = actorOrgId(ctx);
          return seed.orgUnits.filter((unit) => unit.organizationId === orgId);
        },
        people: (_parent, _args, ctx: ComatrixContext) => {
          const orgId = actorOrgId(ctx);
          return seed.people.filter((person) => person.organizationId === orgId);
        },
        person: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          const person = findPerson(args.id);
          if (!person) {
            return null;
          }
          requireSameOrg(ctx, person.organizationId);
          return person;
        },
        currentAssignment: (_parent, args: { personId: string }, ctx: ComatrixContext) => {
          const person = findPerson(args.personId);
          if (!person) {
            return null;
          }
          requireSameOrg(ctx, person.organizationId);
          return currentAssignmentForPerson(seed.assignments, args.personId) ?? null;
        },
        directReports: (_parent, args: { managerPersonId: string }, ctx: ComatrixContext) => {
          const manager = findPerson(args.managerPersonId);
          if (!manager) {
            return [];
          }
          requireSameOrg(ctx, manager.organizationId);
          return directReportsOf(seed.assignments, args.managerPersonId);
        },
        roleProfile: (_parent, args: { id: string }) => roleProfileById(args.id),
        matrix: (_parent, args: { id: string }) => matrixById(args.id),
        assessment: (_parent, args: { id: string }) => assessmentById(args.id),
        developmentPlan: (_parent, args: { assessmentId: string }) =>
          seed.developmentPlans.find((plan) => plan.assessmentId === args.assessmentId) ?? null,
        calibrationSessions: (_parent, _args, ctx: ComatrixContext) => {
          const orgId = actorOrgId(ctx);
          return seed.calibrationSessions.filter((session) => session.organizationId === orgId);
        },
        levelScales: (_parent, _args, ctx: ComatrixContext) => {
          const orgId = actorOrgId(ctx);
          return seed.levelScales.filter((scale) => scale.organizationId === orgId);
        },
        scoringRules: (_parent, _args, ctx: ComatrixContext) => {
          const orgId = actorOrgId(ctx);
          return seed.scoringRules.filter((rule) => rule.organizationId === orgId);
        },
        managerDashboard: (_parent, args: { managerPersonId: string }, ctx: ComatrixContext) => {
          const manager = findPerson(args.managerPersonId);
          if (!manager) {
            return null;
          }
          requireSameOrg(ctx, manager.organizationId);
          return { managerPersonId: manager.id, reports: managerTeamCoverage(seed, args.managerPersonId) };
        },
        organizationGapSummary: (_parent, _args, ctx: ComatrixContext) => organizationGapSummary(seed),
      },
      Mutation: {
        createPerson: (_parent, args: { input: { fullName: string; email: string } }, ctx: ComatrixContext) => {
          const organizationId = actorOrgId(ctx);
          const person = {
            id: `person-${args.input.email.toLowerCase()}`,
            organizationId,
            fullName: args.input.fullName,
            email: args.input.email,
            status: 'active' as const,
          };
          seed.people.push(person);
          return person;
        },
        createAssignment: (
          _parent,
          args: {
            input: {
              personId: string;
              orgUnitId: string;
              managerPersonId?: string | null;
              roleProfileId: string;
              effectiveFrom: string;
            };
          },
          ctx: ComatrixContext,
        ) => {
          const person = findPerson(args.input.personId);
          if (!person) {
            throw new Error(`Unknown person ${args.input.personId}`);
          }
          requireSameOrg(ctx, person.organizationId);
          const assignment = {
            id: `assignment-${args.input.personId}-${Date.now()}`,
            personId: args.input.personId,
            orgUnitId: args.input.orgUnitId,
            managerPersonId: args.input.managerPersonId ?? undefined,
            roleProfileId: args.input.roleProfileId,
            effectiveFrom: args.input.effectiveFrom,
            status: 'active' as const,
          };
          seed.assignments.push(assignment);
          return assignment;
        },
        archiveAssignment: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          const assignment = seed.assignments.find((item) => item.id === args.id);
          if (!assignment) {
            throw new Error(`Unknown assignment ${args.id}`);
          }
          const person = findPerson(assignment.personId);
          if (person) {
            requireSameOrg(ctx, person.organizationId);
          }
          assignment.status = 'archived';
          return assignment;
        },
        setDefaultScoringRule: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          const rule = seed.scoringRules.find((item) => item.id === args.id);
          if (!rule) {
            throw new Error(`Unknown scoring rule ${args.id}`);
          }
          requireSameOrg(ctx, rule.organizationId);
          for (const item of seed.scoringRules) {
            if (item.organizationId === rule.organizationId) {
              item.isDefault = item.id === rule.id;
            }
          }
          return rule;
        },
      },
      CompetencyCategory: {
        competencies: (category: { id: string }) =>
          seed.competencies.filter((competency) => competency.categoryId === category.id),
      },
      User: {
        person: (user: { personId?: string }) =>
          user.personId ? (seed.people.find((person) => person.id === user.personId) ?? null) : null,
      },
      Person: {
        currentAssignment: (person: { id: string }) =>
          currentAssignmentForPerson(seed.assignments, person.id) ?? null,
      },
      Assignment: {
        person: (assignment: { personId: string }) => personById(assignment.personId),
        orgUnit: (assignment: { orgUnitId: string }) =>
          seed.orgUnits.find((unit) => unit.id === assignment.orgUnitId) ?? null,
        manager: (assignment: { managerPersonId?: string }) =>
          assignment.managerPersonId ? findPerson(assignment.managerPersonId) : null,
        roleProfile: (assignment: { roleProfileId: string }) => roleProfileById(assignment.roleProfileId),
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
      CalibrationSession: {
        decisions: (session: { id: string }) =>
          seed.calibrationDecisions.filter((decision) => decision.sessionId === session.id),
      },
      CalibrationDecision: {
        diff: (decision: { calibratedLevel: number; originalLevel: number }) =>
          decision.calibratedLevel - decision.originalLevel,
        score: (decision: { assessmentScoreId: string }) => {
          const score = seed.assessments
            .flatMap((assessment) => assessment.scores)
            .find((item) => item.id === decision.assessmentScoreId);
          if (!score) {
            throw new Error(`Unknown assessment score ${decision.assessmentScoreId}`);
          }
          return score;
        },
      },
      LevelScale: {
        levels: (scale: { id: string }) =>
          seed.levels
            .filter((level) => level.scaleId === scale.id)
            .sort((a, b) => a.value - b.value),
        dimensionDescriptors: (scale: { id: string }) =>
          seed.levelDimensionDescriptors
            .filter((descriptor) => descriptor.scaleId === scale.id)
            .sort((a, b) => a.levelValue - b.levelValue || a.dimension.localeCompare(b.dimension)),
      },
    },
  });
}

export const executableSchema = createExecutableSchema();
