import { schema } from '@comatrix/api-contracts';
import { applyCompetencyImport, calculateGaps, currentAssignmentForPerson, directReportsOf, managerTeamCoverage, mvpSeed, organizationGapSummary, parseCompetencyImport, recordAuditEvent, toGapExportRows, toMatrixRequirementExportRows, type MvpSeed } from '@comatrix/domain';
import { createSchema } from 'graphql-yoga';
import { createGraphQLError } from 'graphql-yoga';
import { DEFAULT_AUTH_PROVIDER, type AuthProvider, type Session } from './auth.js';
import { requirePermission } from './rbac.js';

export interface ComatrixContext {
  currentUserId: string;
  session: Session;
}

export const DEFAULT_DEV_USER_ID = 'user-alexey';

export function createComatrixContext(provider: AuthProvider = DEFAULT_AUTH_PROVIDER, initial?: { session: Session }) {
  return (ctx: { request?: { headers?: { get(name: string): string | null } } }): ComatrixContext => {
    if (initial?.session) {
      return { currentUserId: initial.session.userId, session: initial.session };
    }
    const request = ctx.request ?? { headers: { get: () => null as string | null } };
    const session = provider.resolveSession(request, mvpSeed.users);
    if (!session) {
      throw new Error('Unauthenticated: no session resolved');
    }
    return { currentUserId: session.userId, session };
  };
}

export function createExecutableSchema(seed: MvpSeed = mvpSeed, provider: AuthProvider = DEFAULT_AUTH_PROVIDER) {
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
    return ctx.session.organizationId;
  }

  function auditActor(ctx: ComatrixContext) {
    return { userId: ctx.session.userId, personId: ctx.session.personId, organizationId: ctx.session.organizationId };
  }

  function requireSameOrg(ctx: ComatrixContext, recordOrgId: string) {
    if (actorOrgId(ctx) !== recordOrgId) {
      throw createGraphQLError('Cross-organization access is not allowed', { extensions: { code: 'FORBIDDEN' } });
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
        roleFamilies: (_parent, _args, ctx: ComatrixContext) => {
          const orgId = actorOrgId(ctx);
          return seed.roleFamilies.filter((f) => f.organizationId === orgId);
        },
        roles: () => seed.roles,
        grades: (_parent, _args, ctx: ComatrixContext) => {
          const orgId = actorOrgId(ctx);
          return seed.grades.filter((g) => g.organizationId === orgId);
        },
        roleProfiles: () => seed.roleProfiles,
        matrices: () => seed.matrices,
        assessments: (_parent, _args, ctx: ComatrixContext) => {
          const orgId = actorOrgId(ctx);
          const personIds = new Set(seed.people.filter((p) => p.organizationId === orgId).map((p) => p.id));
          return seed.assessments.filter((a) => personIds.has(a.personId));
        },
        managerDashboard: (_parent, args: { managerPersonId: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'analytics.read');
          const manager = findPerson(args.managerPersonId);
          if (!manager) {
            return null;
          }
          requireSameOrg(ctx, manager.organizationId);
          return { managerPersonId: manager.id, reports: managerTeamCoverage(seed, args.managerPersonId) };
        },
        organizationGapSummary: (_parent, _args, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'analytics.read');
          return organizationGapSummary(seed);
        },
        exportMatrixRequirements: (_parent, args: { matrixRevisionId: string }, ctx: ComatrixContext) => {
          const revision = seed.matrixRevisions.find((item) => item.id === args.matrixRevisionId);
          if (!revision) {
            return [];
          }
          const matrix = seed.matrices.find((item) => item.id === revision.matrixId);
          const profile = matrix ? roleProfileById(matrix.roleProfileId) : null;
          if (profile) {
            requireSameOrg(ctx, actorOrgId(ctx));
          }
          void profile;
          return toMatrixRequirementExportRows(seed, args.matrixRevisionId);
        },
        exportGapSummary: (_parent, args: { assessmentId: string }, ctx: ComatrixContext) => {
          const assessment = assessmentById(args.assessmentId);
          if (!assessment) {
            return [];
          }
          const person = findPerson(assessment.personId);
          if (person) {
            requireSameOrg(ctx, person.organizationId);
          }
          return toGapExportRows(seed, args.assessmentId);
        },
        auditEvents: (_parent, args: { entityType?: string | null; entityId?: string | null; limit?: number | null }, ctx: ComatrixContext) => {
          const orgId = actorOrgId(ctx);
          const limit = args.limit ?? 20;
          return seed.auditEvents
            .filter((event) => event.organizationId === orgId)
            .filter((event) => !args.entityType || event.entityType === args.entityType)
            .filter((event) => !args.entityId || event.entityId === args.entityId)
            .slice(-limit)
            .reverse();
        },
      },
      Mutation: {
        createPerson: (_parent, args: { input: { fullName: string; email: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'person.write');
          const organizationId = actorOrgId(ctx);
          const person = {
            id: `person-${args.input.email.toLowerCase()}`,
            organizationId,
            fullName: args.input.fullName,
            email: args.input.email,
            status: 'active' as const,
          };
          seed.people.push(person);
          recordAuditEvent(seed, auditActor(ctx), 'person_created', {
            entityType: 'person',
            entityId: person.id,
            summary: `Created person ${person.fullName}`,
            metadata: { email: person.email },
          });
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
          requirePermission(ctx.session, 'assignment.write');
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
          recordAuditEvent(seed, auditActor(ctx), 'assignment_created', {
            entityType: 'assignment',
            entityId: assignment.id,
            summary: `Assigned ${assignment.personId} to ${assignment.orgUnitId}`,
          });
          return assignment;
        },
        archiveAssignment: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'assignment.write');
          const assignment = seed.assignments.find((item) => item.id === args.id);
          if (!assignment) {
            throw new Error(`Unknown assignment ${args.id}`);
          }
          const person = findPerson(assignment.personId);
          if (person) {
            requireSameOrg(ctx, person.organizationId);
          }
          assignment.status = 'archived';
          recordAuditEvent(seed, auditActor(ctx), 'assignment_archived', {
            entityType: 'assignment',
            entityId: assignment.id,
            summary: `Archived assignment ${assignment.id}`,
          });
          return assignment;
        },
        setDefaultScoringRule: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
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
          recordAuditEvent(seed, auditActor(ctx), 'scoring_rule_default_set', {
            entityType: 'scoring_rule',
            entityId: rule.id,
            summary: `Set default scoring rule to ${rule.name}`,
          });
          return rule;
        },
        importCompetencies: (
          _parent,
          args: { input: Array<{ category: string; categoryType?: string | null; code: string; name: string; description?: string | null; tags?: string[] | null }> },
          ctx: ComatrixContext,
        ) => {
          requirePermission(ctx.session, 'methodology.write');
          const report = parseCompetencyImport(
            args.input.map((row) => ({
              category: row.category,
              categoryType: row.categoryType ?? undefined,
              code: row.code,
              name: row.name,
              description: row.description ?? undefined,
              tags: row.tags ?? undefined,
            })),
          );
          if (report.valid) {
            const { categoriesAdded, competenciesAdded } = applyCompetencyImport(seed, report);
            report.applied = true;
            recordAuditEvent(seed, auditActor(ctx), 'competencies_imported', {
              entityType: 'ontology',
              entityId: seed.organization.id,
              summary: `Imported ${competenciesAdded} competencies across ${categoriesAdded} categories`,
              metadata: { competenciesAdded, categoriesAdded },
            });
          }
          return {
            applied: report.applied,
            rowCount: report.rowCount,
            valid: report.valid,
            errors: report.errors,
            categoriesParsed: report.parsed.categories.length,
            competenciesParsed: report.parsed.competencies.length,
          };
        },
        finalizeAssessment: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'assessment.finalize');
          const assessment = assessmentById(args.id);
          if (!assessment) {
            throw new Error(`Unknown assessment ${args.id}`);
          }
          const person = findPerson(assessment.personId);
          if (person) {
            requireSameOrg(ctx, person.organizationId);
          }
          assessment.status = 'finalized';
          recordAuditEvent(seed, auditActor(ctx), 'assessment_finalized', {
            entityType: 'assessment',
            entityId: assessment.id,
            summary: `Finalized assessment ${assessment.id}`,
          });
          return assessment;
        },
        activateMatrix: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'matrix.activate');
          const matrix = matrixById(args.id);
          if (!matrix) {
            throw new Error(`Unknown matrix ${args.id}`);
          }
          const profile = roleProfileById(matrix.roleProfileId);
          if (profile) {
            requireSameOrg(ctx, actorOrgId(ctx));
          }
          matrix.status = 'active';
          recordAuditEvent(seed, auditActor(ctx), 'matrix_activated', {
            entityType: 'matrix',
            entityId: matrix.id,
            summary: `Activated matrix ${matrix.name}`,
          });
          return matrix;
        },

        updatePerson: (_parent, args: { input: { id: string; fullName?: string | null; email?: string | null; status?: string | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'person.write');
          const person = findPerson(args.input.id);
          if (!person) throw new Error(`Unknown person ${args.input.id}`);
          requireSameOrg(ctx, person.organizationId);
          if (args.input.fullName != null) person.fullName = args.input.fullName;
          if (args.input.email != null) person.email = args.input.email;
          if (args.input.status != null) person.status = args.input.status as never;
          return person;
        },

        createOrgUnit: (_parent, args: { input: { organizationId: string; parentId?: string | null; type: string; name: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'person.write');
          requireSameOrg(ctx, args.input.organizationId);
          const unit = {
            id: `unit-${Date.now()}`,
            organizationId: args.input.organizationId,
            parentId: args.input.parentId ?? undefined,
            type: args.input.type as 'company' | 'department' | 'team',
            name: args.input.name,
            status: 'active' as const,
          };
          seed.orgUnits.push(unit);
          return unit;
        },
        updateOrgUnit: (_parent, args: { input: { id: string; parentId?: string | null; name?: string | null; type?: string | null; status?: string | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'person.write');
          const unit = seed.orgUnits.find((u) => u.id === args.input.id);
          if (!unit) throw new Error(`Unknown org unit ${args.input.id}`);
          requireSameOrg(ctx, unit.organizationId);
          if (args.input.parentId != null) unit.parentId = args.input.parentId;
          if (args.input.name != null) unit.name = args.input.name;
          if (args.input.type != null) unit.type = args.input.type as never;
          if (args.input.status != null) unit.status = args.input.status as never;
          return unit;
        },

        createCompetencyCategory: (_parent, args: { input: { organizationId: string; parentId?: string | null; categoryType: string; name: string; description?: string | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          requireSameOrg(ctx, args.input.organizationId);
          const category = {
            id: `cat-${Date.now()}`,
            organizationId: args.input.organizationId,
            parentId: args.input.parentId ?? undefined,
            categoryType: args.input.categoryType,
            name: args.input.name,
            description: args.input.description ?? '',
            sourceKind: 'organization_custom' as const,
            sortOrder: (seed.categories.at(-1)?.sortOrder ?? 0) + 10,
            status: 'active' as const,
          };
          seed.categories.push(category);
          return category;
        },
        updateCompetencyCategory: (_parent, args: { input: { id: string; name?: string | null; description?: string | null; categoryType?: string | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          const category = seed.categories.find((c) => c.id === args.input.id);
          if (!category) throw new Error(`Unknown category ${args.input.id}`);
          requireSameOrg(ctx, category.organizationId);
          if (args.input.name != null) category.name = args.input.name;
          if (args.input.description != null) category.description = args.input.description;
          if (args.input.categoryType != null) category.categoryType = args.input.categoryType;
          return category;
        },
        deleteCompetencyCategory: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          const idx = seed.categories.findIndex((c) => c.id === args.id);
          if (idx < 0) return false;
          requireSameOrg(ctx, seed.categories[idx].organizationId);
          seed.categories.splice(idx, 1);
          return true;
        },
        createCompetency: (_parent, args: { input: { organizationId: string; categoryId: string; code: string; name: string; description?: string | null; tags?: string[] | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          requireSameOrg(ctx, args.input.organizationId);
          const competency = {
            id: `comp-${Date.now()}`,
            organizationId: args.input.organizationId,
            categoryId: args.input.categoryId,
            code: args.input.code,
            name: args.input.name,
            description: args.input.description ?? '',
            sourceKind: 'organization_custom' as const,
            validationStatus: 'draft' as const,
            tags: args.input.tags ?? [],
            behavioralIndicators: [],
          };
          seed.competencies.push(competency);
          return competency;
        },
        updateCompetency: (_parent, args: { input: { id: string; name?: string | null; description?: string | null; categoryId?: string | null; tags?: string[] | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          const competency = seed.competencies.find((c) => c.id === args.input.id);
          if (!competency) throw new Error(`Unknown competency ${args.input.id}`);
          requireSameOrg(ctx, competency.organizationId);
          if (args.input.name != null) competency.name = args.input.name;
          if (args.input.description != null) competency.description = args.input.description;
          if (args.input.categoryId != null) competency.categoryId = args.input.categoryId;
          if (args.input.tags != null) competency.tags = args.input.tags;
          return competency;
        },
        deleteCompetency: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          const idx = seed.competencies.findIndex((c) => c.id === args.id);
          if (idx < 0) return false;
          requireSameOrg(ctx, seed.competencies[idx].organizationId);
          seed.competencies.splice(idx, 1);
          return true;
        },

        createRoleFamily: (_parent, args: { input: { organizationId: string; name: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          requireSameOrg(ctx, args.input.organizationId);
          const family = { id: `family-${Date.now()}`, organizationId: args.input.organizationId, name: args.input.name };
          seed.roleFamilies.push(family);
          return family;
        },
        createRole: (_parent, args: { input: { roleFamilyId: string; name: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          const role = { id: `role-${Date.now()}`, roleFamilyId: args.input.roleFamilyId, name: args.input.name };
          seed.roles.push(role);
          return role;
        },
        createGrade: (_parent, args: { input: { organizationId: string; name: string; rank: number } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          requireSameOrg(ctx, args.input.organizationId);
          const grade = { id: `grade-${Date.now()}`, organizationId: args.input.organizationId, name: args.input.name, rank: args.input.rank };
          seed.grades.push(grade);
          return grade;
        },
        createRoleProfile: (_parent, args: { input: { roleId: string; gradeId: string; name: string; description?: string | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          const profile = {
            id: `profile-${Date.now()}`,
            roleId: args.input.roleId,
            gradeId: args.input.gradeId,
            name: args.input.name,
            description: args.input.description ?? '',
          };
          seed.roleProfiles.push(profile);
          return profile;
        },
        createRoleTask: (_parent, args: { input: { roleProfileId: string; name: string; expectedOutcome: string; criticality: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          const task = {
            id: `task-${Date.now()}`,
            roleProfileId: args.input.roleProfileId,
            name: args.input.name,
            expectedOutcome: args.input.expectedOutcome,
            criticality: args.input.criticality as 'low' | 'medium' | 'high',
          };
          seed.roleTasks.push(task);
          return task;
        },
        deleteRoleTask: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          const idx = seed.roleTasks.findIndex((t) => t.id === args.id);
          if (idx < 0) return false;
          seed.roleTasks.splice(idx, 1);
          return true;
        },

        createMatrix: (_parent, args: { input: { roleProfileId: string; name: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'matrix.activate');
          const matrix = {
            id: `matrix-${Date.now()}`,
            roleProfileId: args.input.roleProfileId,
            name: args.input.name,
            status: 'draft' as const,
            activeRevisionId: '',
          };
          const revision = {
            id: `rev-${Date.now()}`,
            matrixId: matrix.id,
            version: 1,
            activatedAt: new Date().toISOString(),
            requirements: [],
          };
          seed.matrices.push(matrix);
          seed.matrixRevisions.push(revision);
          matrix.activeRevisionId = revision.id;
          return matrix;
        },
        upsertMatrixRequirement: (_parent, args: { input: { revisionId: string; competencyId: string; targetLevel: number; normalizedWeight: number; criticality: string; neededOnEntry?: boolean | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'matrix.activate');
          const revision = seed.matrixRevisions.find((r) => r.id === args.input.revisionId);
          if (!revision) throw new Error(`Unknown revision ${args.input.revisionId}`);
          let requirement = revision.requirements.find((r) => r.competencyId === args.input.competencyId);
          if (requirement) {
            requirement.targetLevel = args.input.targetLevel;
            requirement.normalizedWeight = args.input.normalizedWeight;
            requirement.criticality = args.input.criticality as never;
            requirement.neededOnEntry = args.input.neededOnEntry ?? false;
          } else {
            requirement = {
              id: `req-${Date.now()}`,
              competencyId: args.input.competencyId,
              targetLevel: args.input.targetLevel,
              required: true,
              normalizedWeight: args.input.normalizedWeight,
              weightSource: 'manual',
              criticality: args.input.criticality as never,
              neededOnEntry: args.input.neededOnEntry ?? false,
            };
            revision.requirements.push(requirement);
          }
          return requirement;
        },
        deleteMatrixRequirement: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'matrix.activate');
          for (const revision of seed.matrixRevisions) {
            const idx = revision.requirements.findIndex((r) => r.id === args.id);
            if (idx >= 0) {
              revision.requirements.splice(idx, 1);
              return true;
            }
          }
          return false;
        },

        createAssessment: (_parent, args: { input: { personId: string; roleProfileId: string; matrixRevisionId: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'assessment.finalize');
          const person = findPerson(args.input.personId);
          if (!person) throw new Error(`Unknown person ${args.input.personId}`);
          requireSameOrg(ctx, person.organizationId);
          const assessment = {
            id: `assessment-${Date.now()}`,
            personId: args.input.personId,
            roleProfileId: args.input.roleProfileId,
            matrixRevisionId: args.input.matrixRevisionId,
            status: 'draft' as const,
            scores: [],
          };
          seed.assessments.push(assessment);
          return assessment;
        },
        upsertAssessmentScore: (_parent, args: { input: { assessmentId: string; competencyId: string; source: string; level: number; confidence?: number | null; verificationStatus?: string | null; comment?: string | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'assessment.finalize');
          const assessment = assessmentById(args.input.assessmentId);
          if (!assessment) throw new Error(`Unknown assessment ${args.input.assessmentId}`);
          const person = findPerson(assessment.personId);
          if (person) requireSameOrg(ctx, person.organizationId);
          let score = assessment.scores.find((s) => s.competencyId === args.input.competencyId && s.source === args.input.source);
          if (score) {
            score.level = args.input.level;
            score.confidence = args.input.confidence ?? score.confidence;
            score.verificationStatus = (args.input.verificationStatus ?? score.verificationStatus) as never;
            score.comment = args.input.comment ?? score.comment;
          } else {
            score = {
              id: `score-${Date.now()}`,
              competencyId: args.input.competencyId,
              source: args.input.source as never,
              level: args.input.level,
              confidence: args.input.confidence ?? 0.5,
              verificationStatus: (args.input.verificationStatus ?? 'unverified') as never,
              comment: args.input.comment ?? '',
            };
            assessment.scores.push(score);
          }
          return score;
        },

        createCalibrationSession: (_parent, args: { input: { organizationId: string; name: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'assessment.finalize');
          requireSameOrg(ctx, args.input.organizationId);
          const session = {
            id: `calibration-${Date.now()}`,
            organizationId: args.input.organizationId,
            name: args.input.name,
            status: 'open' as const,
          };
          seed.calibrationSessions.push(session);
          return session;
        },
        closeCalibrationSession: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'assessment.finalize');
          const session = seed.calibrationSessions.find((s) => s.id === args.id);
          if (!session) throw new Error(`Unknown calibration session ${args.id}`);
          requireSameOrg(ctx, session.organizationId);
          session.status = 'closed';
          return session;
        },
        addCalibrationDecision: (_parent, args: { input: { sessionId: string; assessmentScoreId: string; originalLevel: number; calibratedLevel: number; reason?: string | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'assessment.finalize');
          const session = seed.calibrationSessions.find((s) => s.id === args.input.sessionId);
          if (!session) throw new Error(`Unknown calibration session ${args.input.sessionId}`);
          requireSameOrg(ctx, session.organizationId);
          const decision = {
            id: `calibration-decision-${Date.now()}`,
            sessionId: args.input.sessionId,
            assessmentScoreId: args.input.assessmentScoreId,
            originalLevel: args.input.originalLevel,
            calibratedLevel: args.input.calibratedLevel,
            reason: args.input.reason ?? '',
          };
          seed.calibrationDecisions.push(decision);
          return decision;
        },
        deleteCalibrationDecision: (_parent, args: { id: string }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'assessment.finalize');
          const idx = seed.calibrationDecisions.findIndex((d) => d.id === args.id);
          if (idx < 0) return false;
          seed.calibrationDecisions.splice(idx, 1);
          return true;
        },

        createLevelScale: (_parent, args: { input: { organizationId: string; name: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          requireSameOrg(ctx, args.input.organizationId);
          const scale = {
            id: `scale-${Date.now()}`,
            organizationId: args.input.organizationId,
            name: args.input.name,
            isDefault: false,
            status: 'draft' as const,
          };
          seed.levelScales.push(scale);
          return scale;
        },
        upsertLevelDimensionDescriptor: (_parent, args: { input: { scaleId: string; levelValue: number; dimension: string; description: string } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          const scale = seed.levelScales.find((s) => s.id === args.input.scaleId);
          if (!scale) throw new Error(`Unknown scale ${args.input.scaleId}`);
          requireSameOrg(ctx, scale.organizationId);
          let descriptor = seed.levelDimensionDescriptors.find(
            (d) => d.scaleId === args.input.scaleId && d.levelValue === args.input.levelValue && d.dimension === args.input.dimension,
          );
          if (descriptor) {
            descriptor.description = args.input.description;
          } else {
            descriptor = {
              id: `dim-${Date.now()}`,
              scaleId: args.input.scaleId,
              levelValue: args.input.levelValue,
              dimension: args.input.dimension as never,
              description: args.input.description,
            };
            seed.levelDimensionDescriptors.push(descriptor);
          }
          return descriptor;
        },
        createScoringRule: (_parent, args: { input: { organizationId: string; name: string; confidenceThreshold?: number | null } }, ctx: ComatrixContext) => {
          requirePermission(ctx.session, 'methodology.write');
          requireSameOrg(ctx, args.input.organizationId);
          const rule = {
            id: `scoring-${Date.now()}`,
            organizationId: args.input.organizationId,
            name: args.input.name,
            confidenceThreshold: args.input.confidenceThreshold ?? 0.7,
            isDefault: false,
            status: 'active' as const,
          };
          seed.scoringRules.push(rule);
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
