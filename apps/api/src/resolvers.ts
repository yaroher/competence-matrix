import { schema } from '@comatrix/api-contracts';
import {
  buildSkillCatalogTree,
  type CompetencyRole,
  type CompetencyRoleSkill,
  type RoleSkillGradeTarget,
  type Skill,
  type SkillCatalogNode,
  type SkillScaleMark,
} from '@comatrix/domain';
import { createSchema } from 'graphql-yoga';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import type {
  AddSkillToCompetencyRoleInput,
  CatalogRepository,
  CreateCompetencyRoleInput,
  CreateGradeInput,
  CreateSkillCatalogFolderInput,
  CreateSkillInput,
  CreateSkillScaleMarkInput,
  DeleteSkillCatalogNodeInput,
  DeleteSkillScaleMarkInput,
  MoveSkillCatalogNodeInput,
  PlaceSkillInCatalogInput,
  RemoveSkillFromCompetencyRoleInput,
  SetRoleSkillGradeTargetInput,
  UpdateCompetencyRoleInput,
  UpdateCompetencyRoleSkillInput,
  UpdateGradeInput,
  UpdateSkillCatalogFolderInput,
  UpdateSkillInput,
  UpdateSkillScaleMarkInput,
} from './catalog-repository.js';
import type {
  AccessRepository,
  AssessmentData,
  EmployeeData,
  Permission,
  ViewerData,
} from './access-repository.js';

export interface AppContext {
  viewer: ViewerData | null;
}

function requireViewer(ctx: AppContext): ViewerData {
  if (!ctx.viewer) {
    throw new GraphQLError('Требуется вход', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return ctx.viewer;
}

function requirePerm(ctx: AppContext, permission: Permission): ViewerData {
  const viewer = requireViewer(ctx);
  if (!viewer.permissions.includes(permission)) {
    throw new GraphQLError('Недостаточно прав', { extensions: { code: 'FORBIDDEN' } });
  }
  return viewer;
}

function viewerShape(v: ViewerData) {
  return { id: v.userId, email: v.email, displayName: v.displayName, roleId: v.roleId, permissions: v.permissions, employeeId: v.employeeId };
}

export function createExecutableSchema(repository: CatalogRepository, access: AccessRepository, jwtSecret: string) {
  const assessmentVisible = async (ctx: AppContext, assignmentEmployeeId: string) => {
    const viewer = ctx.viewer;
    if (!viewer) return false;
    if (viewer.permissions.includes('VIEW_ALL_ASSESSMENTS')) return true;
    if (viewer.employeeId === assignmentEmployeeId) return true;
    if (viewer.employeeId && (await access.ancestorIds(assignmentEmployeeId)).has(viewer.employeeId)) return true;
    return false;
  };

  return createSchema({
    typeDefs: schema,
    resolvers: {
      Query: {
        health: () => ({ ok: true, service: 'comatrix-api' }),
        grades: () => repository.listGrades(),
        skills: () => repository.listSkills(),
        skillCatalogNodes: () => repository.listCatalogNodes(),
        skillCatalogTree: async () => buildSkillCatalogTree(await repository.listCatalogNodes()),
        competencyRoles: () => repository.listCompetencyRoles(),
        competencyRole: (_p: unknown, args: { id: string }) => repository.findCompetencyRole(args.id),

        me: (_p: unknown, _a: unknown, ctx: AppContext) => (ctx.viewer ? viewerShape(ctx.viewer) : null),
        permissions: (_p: unknown, _a: unknown, ctx: AppContext) => {
          requireViewer(ctx);
          return access.listPermissions();
        },
        appRoles: (_p: unknown, _a: unknown, ctx: AppContext) => {
          requireViewer(ctx);
          return access.listAppRoles();
        },
        employees: (_p: unknown, _a: unknown, ctx: AppContext) => {
          requireViewer(ctx);
          return access.listEmployees();
        },
        users: (_p: unknown, _a: unknown, ctx: AppContext) => {
          requirePerm(ctx, 'MANAGE_USERS_ROLES');
          return access.listUsers();
        },
        myAssignments: async (_p: unknown, _a: unknown, ctx: AppContext) => {
          const viewer = requireViewer(ctx);
          if (!viewer.employeeId) return [];
          return access.listAssignmentsForEmployee(viewer.employeeId);
        },
        assignmentsForEmployee: async (_p: unknown, args: { employeeId: string }, ctx: AppContext) => {
          requireViewer(ctx);
          if (!(await assessmentVisible(ctx, args.employeeId))) {
            throw new GraphQLError('Нет доступа к оценкам этого сотрудника', { extensions: { code: 'FORBIDDEN' } });
          }
          return access.listAssignmentsForEmployee(args.employeeId);
        },
        assignment: async (_p: unknown, args: { id: string }, ctx: AppContext) => {
          requireViewer(ctx);
          const assignment = await access.getAssignment(args.id);
          if (!(await assessmentVisible(ctx, assignment.employeeId))) {
            throw new GraphQLError('Нет доступа к этому назначению', { extensions: { code: 'FORBIDDEN' } });
          }
          return assignment;
        },
      },
      Mutation: {
        // catalog (MANAGE_CATALOG)
        createSkill: (_p: unknown, a: { input: CreateSkillInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.createSkill(a.input)),
        updateSkill: (_p: unknown, a: { input: UpdateSkillInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.updateSkill(a.input)),
        createSkillScaleMark: (_p: unknown, a: { input: CreateSkillScaleMarkInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.createSkillScaleMark(a.input)),
        updateSkillScaleMark: (_p: unknown, a: { input: UpdateSkillScaleMarkInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.updateSkillScaleMark(a.input)),
        deleteSkillScaleMark: (_p: unknown, a: { input: DeleteSkillScaleMarkInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.deleteSkillScaleMark(a.input)),
        createSkillCatalogFolder: (_p: unknown, a: { input: CreateSkillCatalogFolderInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.createSkillCatalogFolder(a.input)),
        updateSkillCatalogFolder: (_p: unknown, a: { input: UpdateSkillCatalogFolderInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.updateSkillCatalogFolder(a.input)),
        placeSkillInCatalog: (_p: unknown, a: { input: PlaceSkillInCatalogInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.placeSkillInCatalog(a.input)),
        moveSkillCatalogNode: (_p: unknown, a: { input: MoveSkillCatalogNodeInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.moveSkillCatalogNode(a.input)),
        deleteSkillCatalogNode: (_p: unknown, a: { input: DeleteSkillCatalogNodeInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_CATALOG'), repository.deleteSkillCatalogNode(a.input)),

        // matrices & grades (MANAGE_MATRICES)
        createGrade: (_p: unknown, a: { input: CreateGradeInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_MATRICES'), repository.createGrade(a.input)),
        updateGrade: (_p: unknown, a: { input: UpdateGradeInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_MATRICES'), repository.updateGrade(a.input)),
        createCompetencyRole: (_p: unknown, a: { input: CreateCompetencyRoleInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_MATRICES'), repository.createCompetencyRole(a.input)),
        updateCompetencyRole: (_p: unknown, a: { input: UpdateCompetencyRoleInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_MATRICES'), repository.updateCompetencyRole(a.input)),
        addSkillToCompetencyRole: (_p: unknown, a: { input: AddSkillToCompetencyRoleInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_MATRICES'), repository.createCompetencyRoleSkill(a.input)),
        updateCompetencyRoleSkill: (_p: unknown, a: { input: UpdateCompetencyRoleSkillInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_MATRICES'), repository.updateCompetencyRoleSkill(a.input)),
        removeSkillFromCompetencyRole: (_p: unknown, a: { input: RemoveSkillFromCompetencyRoleInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_MATRICES'), repository.removeCompetencyRoleSkill(a.input)),
        setRoleSkillGradeTarget: (_p: unknown, a: { input: SetRoleSkillGradeTargetInput }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_MATRICES'), repository.setRoleSkillGradeTarget(a.input)),

        // auth
        login: async (_p: unknown, a: { input: { email: string; password: string } }) => {
          const viewer = await access.verifyCredentials(a.input.email, a.input.password);
          if (!viewer) {
            throw new GraphQLError('Неверный email или пароль', { extensions: { code: 'UNAUTHENTICATED' } });
          }
          const token = jwt.sign({ sub: viewer.userId }, jwtSecret, { expiresIn: '30d' });
          return { token, user: viewerShape(viewer) };
        },

        // roles & users (MANAGE_USERS_ROLES)
        createAppRole: (_p: unknown, a: { input: { name: string; permissions: Permission[] } }, ctx: AppContext) => {
          const v = requirePerm(ctx, 'MANAGE_USERS_ROLES');
          return access.createAppRole({ ...a.input, createdByUserId: v.userId });
        },
        updateAppRole: (_p: unknown, a: { input: { id: string; name?: string | null; permissions?: Permission[] | null } }, ctx: AppContext) =>
          (requirePerm(ctx, 'MANAGE_USERS_ROLES'), access.updateAppRole(a.input)),
        deleteAppRole: (_p: unknown, a: { input: { id: string } }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_USERS_ROLES'), access.deleteAppRole(a.input.id)),
        createUser: (_p: unknown, a: { input: { email: string; password: string; displayName: string; roleId: string; employeeId?: string | null } }, ctx: AppContext) =>
          (requirePerm(ctx, 'MANAGE_USERS_ROLES'), access.createUser(a.input)),
        updateUser: (_p: unknown, a: { input: { id: string; email?: string | null; displayName?: string | null; password?: string | null; roleId?: string | null; employeeId?: string | null } }, ctx: AppContext) =>
          (requirePerm(ctx, 'MANAGE_USERS_ROLES'), access.updateUser(a.input)),
        deleteUser: (_p: unknown, a: { input: { id: string } }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_USERS_ROLES'), access.deleteUser(a.input.id)),

        // org tree (MANAGE_ORG)
        createEmployee: (_p: unknown, a: { input: { fullName: string; title?: string | null; managerId?: string | null } }, ctx: AppContext) => {
          const v = requirePerm(ctx, 'MANAGE_ORG');
          return access.createEmployee({ ...a.input, createdByUserId: v.userId });
        },
        updateEmployee: (_p: unknown, a: { input: { id: string; fullName?: string | null; title?: string | null; managerId?: string | null } }, ctx: AppContext) =>
          (requirePerm(ctx, 'MANAGE_ORG'), access.updateEmployee(a.input)),
        deleteEmployee: (_p: unknown, a: { input: { id: string } }, ctx: AppContext) => (requirePerm(ctx, 'MANAGE_ORG'), access.deleteEmployee(a.input.id)),

        // assignments (ASSIGN_MATRICES)
        assignMatrix: (_p: unknown, a: { input: { employeeId: string; roleId: string; gradeId: string } }, ctx: AppContext) => {
          const v = requirePerm(ctx, 'ASSIGN_MATRICES');
          return access.createAssignment({ ...a.input, createdByUserId: v.userId });
        },
        updateAssignment: (_p: unknown, a: { input: { id: string; gradeId: string } }, ctx: AppContext) => (requirePerm(ctx, 'ASSIGN_MATRICES'), access.updateAssignment(a.input)),
        removeAssignment: (_p: unknown, a: { input: { id: string } }, ctx: AppContext) => (requirePerm(ctx, 'ASSIGN_MATRICES'), access.deleteAssignment(a.input.id)),

        // assessments (self or ancestor manager)
        setAssessment: async (_p: unknown, a: { input: { assignmentId: string; skillId: string; value: number } }, ctx: AppContext) => {
          const viewer = requireViewer(ctx);
          const assignment = await access.getAssignment(a.input.assignmentId);
          let kind: 'SELF' | 'MANAGER';
          if (viewer.employeeId && viewer.employeeId === assignment.employeeId) {
            kind = 'SELF';
          } else if (viewer.employeeId && (await access.ancestorIds(assignment.employeeId)).has(viewer.employeeId)) {
            kind = 'MANAGER';
          } else {
            throw new GraphQLError('Нет прав оценивать этого сотрудника', { extensions: { code: 'FORBIDDEN' } });
          }
          return access.setAssessment({ ...a.input, assessorUserId: viewer.userId, kind });
        },
      },
      Skill: {
        marks: (skill: Skill) => repository.listSkillScaleMarks(skill.id),
      },
      SkillScaleMark: {
        skill: (mark: SkillScaleMark) => repository.getSkill(mark.skillId),
      },
      SkillCatalogNode: {
        parent: (node: SkillCatalogNode) => repository.getCatalogNodeParent(node),
        skill: (node: SkillCatalogNode) => repository.getCatalogNodeSkill(node),
        children: (node: SkillCatalogNode) => repository.listCatalogNodeChildren(node.id),
      },
      CompetencyRole: {
        skills: (role: CompetencyRole) => repository.listCompetencyRoleSkills(role.id),
      },
      CompetencyRoleSkill: {
        role: (roleSkill: CompetencyRoleSkill) => repository.getCompetencyRole(roleSkill.roleId),
        skill: (roleSkill: CompetencyRoleSkill) => repository.getSkill(roleSkill.skillId),
        gradeTargets: (roleSkill: CompetencyRoleSkill) => repository.listRoleSkillGradeTargets(roleSkill.id),
      },
      RoleSkillGradeTarget: {
        roleSkill: (target: RoleSkillGradeTarget) => repository.getCompetencyRoleSkill(target.roleSkillId),
        grade: (target: RoleSkillGradeTarget) => repository.getGrade(target.gradeId),
      },
      Viewer: {
        role: (v: { roleId: string }) => access.getAppRole(v.roleId),
        employee: (v: { employeeId: string | null }) => (v.employeeId ? access.getEmployee(v.employeeId) : null),
      },
      AppUser: {
        role: (u: { roleId: string }) => access.getAppRole(u.roleId),
        employee: (u: { employeeId: string | null }) => (u.employeeId ? access.getEmployee(u.employeeId) : null),
      },
      Employee: {
        manager: async (e: EmployeeData) => (e.managerId ? access.getEmployee(e.managerId) : null),
        reports: async (e: EmployeeData) => (await access.listEmployees()).filter((x) => x.managerId === e.id),
      },
      MatrixAssignment: {
        employee: (a: { employeeId: string }) => access.getEmployee(a.employeeId),
        role: (a: { roleId: string }) => repository.getCompetencyRole(a.roleId),
        grade: (a: { gradeId: string }) => repository.getGrade(a.gradeId),
        assessments: async (a: { id: string; employeeId: string }, _args: unknown, ctx: AppContext) => {
          const all = await access.listAssessmentsForAssignment(a.id);
          if (await assessmentVisible(ctx, a.employeeId)) {
            return all;
          }
          if (ctx.viewer && ctx.viewer.employeeId === a.employeeId) {
            return all.filter((x) => x.kind === 'SELF');
          }
          return [];
        },
        canAssessSelf: (a: { employeeId: string }, _args: unknown, ctx: AppContext) => Boolean(ctx.viewer?.employeeId && ctx.viewer.employeeId === a.employeeId),
        canAssessManager: async (a: { employeeId: string }, _args: unknown, ctx: AppContext) =>
          Boolean(ctx.viewer?.employeeId && (await access.ancestorIds(a.employeeId)).has(ctx.viewer.employeeId)),
      },
      Assessment: {
        assessorName: async (a: AssessmentData) => (await access.getUserBrief(a.assessorUserId))?.displayName ?? 'Неизвестно',
      },
    },
  });
}
