import { randomUUID } from 'node:crypto';
import {
  appPermission,
  appRoles,
  appUsers,
  assessments,
  competencyRoles,
  employees,
  grades,
  matrixAssignments,
  rolePermissions,
  skills,
  type ComatrixDb,
} from '@comatrix/db';
import { assertSkillScaleValue, DomainError } from '@comatrix/domain';
import { and, asc, eq, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export type Permission = (typeof appPermission.enumValues)[number];
export type AssessmentKindValue = 'SELF' | 'MANAGER';

export interface ViewerData {
  userId: string;
  email: string;
  displayName: string;
  roleId: string;
  permissions: Permission[];
  employeeId: string | null;
}

export interface AppRoleData {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: Permission[];
}

export interface EmployeeData {
  id: string;
  fullName: string;
  title: string;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppUserData {
  id: string;
  email: string;
  displayName: string;
  roleId: string;
  employeeId: string | null;
}

export interface AssignmentData {
  id: string;
  employeeId: string;
  roleId: string;
  gradeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentData {
  id: string;
  assignmentId: string;
  skillId: string;
  assessorUserId: string;
  kind: AssessmentKindValue;
  value: number;
  updatedAt: string;
}

function iso(value: Date) {
  return value.toISOString();
}

export class AccessRepository {
  constructor(private readonly db: ComatrixDb) {}

  // --- auth ---
  async verifyCredentials(email: string, password: string): Promise<ViewerData | null> {
    const [user] = await this.db.select().from(appUsers).where(eq(appUsers.email, email.trim().toLowerCase()));
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return null;
    }
    return this.loadViewer(user.id);
  }

  async loadViewer(userId: string): Promise<ViewerData | null> {
    const [user] = await this.db.select().from(appUsers).where(eq(appUsers.id, userId));
    if (!user) {
      return null;
    }
    const perms = await this.db.select().from(rolePermissions).where(eq(rolePermissions.roleId, user.roleId));
    return {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      roleId: user.roleId,
      permissions: perms.map((p) => p.permission),
      employeeId: user.employeeId,
    };
  }

  // --- roles & permissions ---
  listPermissions(): Permission[] {
    return [...appPermission.enumValues];
  }

  async listAppRoles(): Promise<AppRoleData[]> {
    const roles = await this.db.select().from(appRoles).orderBy(asc(appRoles.name));
    const perms = await this.db.select().from(rolePermissions);
    const byRole = new Map<string, Permission[]>();
    for (const p of perms) {
      const list = byRole.get(p.roleId) ?? [];
      list.push(p.permission);
      byRole.set(p.roleId, list);
    }
    return roles.map((r) => ({ id: r.id, name: r.name, isSystem: r.isSystem, permissions: byRole.get(r.id) ?? [] }));
  }

  async getAppRole(id: string): Promise<AppRoleData> {
    const role = (await this.listAppRoles()).find((r) => r.id === id);
    if (!role) {
      throw new DomainError(`Неизвестная роль ${id}`);
    }
    return role;
  }

  async createAppRole(input: { name: string; permissions: Permission[]; createdByUserId: string }): Promise<AppRoleData> {
    const id = `role-${randomUUID()}`;
    await this.db.insert(appRoles).values({ id, name: input.name.trim(), createdByUserId: input.createdByUserId });
    if (input.permissions.length > 0) {
      await this.db.insert(rolePermissions).values(input.permissions.map((permission) => ({ roleId: id, permission })));
    }
    return this.getAppRole(id);
  }

  async updateAppRole(input: { id: string; name?: string | null; permissions?: Permission[] | null }): Promise<AppRoleData> {
    const [existing] = await this.db.select().from(appRoles).where(eq(appRoles.id, input.id));
    if (!existing) {
      throw new DomainError(`Неизвестная роль ${input.id}`);
    }
    if (input.name != null) {
      await this.db.update(appRoles).set({ name: input.name.trim(), updatedAt: new Date() }).where(eq(appRoles.id, input.id));
    }
    if (input.permissions != null) {
      await this.db.delete(rolePermissions).where(eq(rolePermissions.roleId, input.id));
      if (input.permissions.length > 0) {
        await this.db.insert(rolePermissions).values(input.permissions.map((permission) => ({ roleId: input.id, permission })));
      }
    }
    return this.getAppRole(input.id);
  }

  async deleteAppRole(id: string): Promise<string> {
    const [existing] = await this.db.select().from(appRoles).where(eq(appRoles.id, id));
    if (!existing) {
      throw new DomainError(`Неизвестная роль ${id}`);
    }
    if (existing.isSystem) {
      throw new DomainError('Системную роль нельзя удалить');
    }
    const [usedBy] = await this.db.select().from(appUsers).where(eq(appUsers.roleId, id));
    if (usedBy) {
      throw new DomainError('Роль назначена пользователям — сначала переназначьте');
    }
    await this.db.delete(appRoles).where(eq(appRoles.id, id));
    return id;
  }

  // --- employees / org tree ---
  async listEmployees(): Promise<EmployeeData[]> {
    const rows = await this.db.select().from(employees).orderBy(asc(employees.fullName));
    return rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      title: r.title,
      managerId: r.managerId,
      createdAt: iso(r.createdAt),
      updatedAt: iso(r.updatedAt),
    }));
  }

  async getEmployee(id: string): Promise<EmployeeData> {
    const all = await this.listEmployees();
    const found = all.find((e) => e.id === id);
    if (!found) {
      throw new DomainError(`Неизвестный сотрудник ${id}`);
    }
    return found;
  }

  /** Ancestor employee ids (excluding self), walking up the strict manager tree. */
  async ancestorIds(employeeId: string): Promise<Set<string>> {
    const all = await this.listEmployees();
    const byId = new Map(all.map((e) => [e.id, e]));
    const result = new Set<string>();
    let cursor = byId.get(employeeId)?.managerId ?? null;
    const guard = new Set<string>();
    while (cursor && !guard.has(cursor)) {
      guard.add(cursor);
      result.add(cursor);
      cursor = byId.get(cursor)?.managerId ?? null;
    }
    return result;
  }

  /** Descendant employee ids (excluding self) beneath a manager. */
  async descendantIds(employeeId: string): Promise<Set<string>> {
    const all = await this.listEmployees();
    const childrenByParent = new Map<string, string[]>();
    for (const e of all) {
      if (e.managerId) {
        const list = childrenByParent.get(e.managerId) ?? [];
        list.push(e.id);
        childrenByParent.set(e.managerId, list);
      }
    }
    const result = new Set<string>();
    const stack = [...(childrenByParent.get(employeeId) ?? [])];
    while (stack.length) {
      const id = stack.pop()!;
      if (result.has(id)) continue;
      result.add(id);
      (childrenByParent.get(id) ?? []).forEach((c) => stack.push(c));
    }
    return result;
  }

  async createEmployee(input: { fullName: string; title?: string | null; managerId?: string | null; createdByUserId: string }): Promise<EmployeeData> {
    if (input.managerId) {
      await this.getEmployee(input.managerId);
    }
    const id = `emp-${randomUUID()}`;
    await this.db.insert(employees).values({
      id,
      fullName: input.fullName.trim(),
      title: input.title?.trim() ?? '',
      managerId: input.managerId ?? null,
      createdByUserId: input.createdByUserId,
    });
    return this.getEmployee(id);
  }

  async updateEmployee(input: { id: string; fullName?: string | null; title?: string | null; managerId?: string | null }): Promise<EmployeeData> {
    const existing = await this.getEmployee(input.id);
    if (input.managerId !== undefined && input.managerId !== null) {
      if (input.managerId === input.id) {
        throw new DomainError('Сотрудник не может быть своим руководителем');
      }
      const descendants = await this.descendantIds(input.id);
      if (descendants.has(input.managerId)) {
        throw new DomainError('Нельзя назначить руководителем своего подчинённого (цикл)');
      }
    }
    await this.db
      .update(employees)
      .set({
        fullName: input.fullName?.trim() ?? existing.fullName,
        title: input.title?.trim() ?? existing.title,
        managerId: input.managerId === undefined ? existing.managerId : input.managerId,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, input.id));
    return this.getEmployee(input.id);
  }

  async deleteEmployee(id: string): Promise<string> {
    await this.getEmployee(id);
    // reports become roots (managerId set null via FK); assignments cascade.
    await this.db.delete(employees).where(eq(employees.id, id));
    return id;
  }

  // --- users ---
  async listUsers(): Promise<AppUserData[]> {
    const rows = await this.db.select().from(appUsers).orderBy(asc(appUsers.displayName));
    return rows.map((r) => ({ id: r.id, email: r.email, displayName: r.displayName, roleId: r.roleId, employeeId: r.employeeId }));
  }

  async getUserBrief(id: string): Promise<AppUserData | null> {
    const [r] = await this.db.select().from(appUsers).where(eq(appUsers.id, id));
    return r ? { id: r.id, email: r.email, displayName: r.displayName, roleId: r.roleId, employeeId: r.employeeId } : null;
  }

  async createUser(input: { email: string; password: string; displayName: string; roleId: string; employeeId?: string | null }): Promise<AppUserData> {
    await this.getAppRole(input.roleId);
    const id = `user-${randomUUID()}`;
    await this.db.insert(appUsers).values({
      id,
      email: input.email.trim().toLowerCase(),
      passwordHash: bcrypt.hashSync(input.password, 10),
      displayName: input.displayName.trim(),
      roleId: input.roleId,
      employeeId: input.employeeId ?? null,
    });
    const user = await this.getUserBrief(id);
    if (!user) throw new DomainError('Не удалось создать пользователя');
    return user;
  }

  async updateUser(input: {
    id: string;
    email?: string | null;
    displayName?: string | null;
    password?: string | null;
    roleId?: string | null;
    employeeId?: string | null;
  }): Promise<AppUserData> {
    const [existing] = await this.db.select().from(appUsers).where(eq(appUsers.id, input.id));
    if (!existing) {
      throw new DomainError(`Неизвестный пользователь ${input.id}`);
    }
    await this.db
      .update(appUsers)
      .set({
        email: input.email?.trim().toLowerCase() ?? existing.email,
        displayName: input.displayName?.trim() ?? existing.displayName,
        passwordHash: input.password ? bcrypt.hashSync(input.password, 10) : existing.passwordHash,
        roleId: input.roleId ?? existing.roleId,
        employeeId: input.employeeId === undefined ? existing.employeeId : input.employeeId,
        updatedAt: new Date(),
      })
      .where(eq(appUsers.id, input.id));
    const user = await this.getUserBrief(input.id);
    if (!user) throw new DomainError('Не удалось обновить пользователя');
    return user;
  }

  async deleteUser(id: string): Promise<string> {
    await this.db.delete(appUsers).where(eq(appUsers.id, id));
    return id;
  }

  // --- assignments ---
  private mapAssignment = (r: typeof matrixAssignments.$inferSelect): AssignmentData => ({
    id: r.id,
    employeeId: r.employeeId,
    roleId: r.roleId,
    gradeId: r.gradeId,
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  });

  async listAssignmentsForEmployee(employeeId: string): Promise<AssignmentData[]> {
    const rows = await this.db.select().from(matrixAssignments).where(eq(matrixAssignments.employeeId, employeeId));
    return rows.map(this.mapAssignment);
  }

  async listAssignmentsForEmployees(employeeIds: string[]): Promise<AssignmentData[]> {
    if (employeeIds.length === 0) return [];
    const rows = await this.db.select().from(matrixAssignments).where(inArray(matrixAssignments.employeeId, employeeIds));
    return rows.map(this.mapAssignment);
  }

  async getAssignment(id: string): Promise<AssignmentData> {
    const [r] = await this.db.select().from(matrixAssignments).where(eq(matrixAssignments.id, id));
    if (!r) {
      throw new DomainError(`Неизвестное назначение ${id}`);
    }
    return this.mapAssignment(r);
  }

  async createAssignment(input: { employeeId: string; roleId: string; gradeId: string; createdByUserId: string }): Promise<AssignmentData> {
    await this.getEmployee(input.employeeId);
    const [role] = await this.db.select().from(competencyRoles).where(eq(competencyRoles.id, input.roleId));
    if (!role) throw new DomainError(`Неизвестная матрица ${input.roleId}`);
    const [grade] = await this.db.select().from(grades).where(eq(grades.id, input.gradeId));
    if (!grade) throw new DomainError(`Неизвестный грейд ${input.gradeId}`);
    const [existing] = await this.db
      .select()
      .from(matrixAssignments)
      .where(and(eq(matrixAssignments.employeeId, input.employeeId), eq(matrixAssignments.roleId, input.roleId)));
    if (existing) {
      throw new DomainError('Матрица уже назначена этому сотруднику');
    }
    const id = `assign-${randomUUID()}`;
    await this.db.insert(matrixAssignments).values({ id, ...input });
    return this.getAssignment(id);
  }

  async updateAssignment(input: { id: string; gradeId: string }): Promise<AssignmentData> {
    await this.getAssignment(input.id);
    const [grade] = await this.db.select().from(grades).where(eq(grades.id, input.gradeId));
    if (!grade) throw new DomainError(`Неизвестный грейд ${input.gradeId}`);
    await this.db.update(matrixAssignments).set({ gradeId: input.gradeId, updatedAt: new Date() }).where(eq(matrixAssignments.id, input.id));
    return this.getAssignment(input.id);
  }

  async deleteAssignment(id: string): Promise<string> {
    await this.db.delete(matrixAssignments).where(eq(matrixAssignments.id, id));
    return id;
  }

  // --- assessments ---
  async listAssessmentsForAssignment(assignmentId: string): Promise<AssessmentData[]> {
    const rows = await this.db.select().from(assessments).where(eq(assessments.assignmentId, assignmentId));
    return rows.map((r) => ({
      id: r.id,
      assignmentId: r.assignmentId,
      skillId: r.skillId,
      assessorUserId: r.assessorUserId,
      kind: r.kind,
      value: r.value,
      updatedAt: iso(r.updatedAt),
    }));
  }

  async setAssessment(input: {
    assignmentId: string;
    skillId: string;
    assessorUserId: string;
    kind: AssessmentKindValue;
    value: number;
  }): Promise<AssessmentData> {
    const [skill] = await this.db.select().from(skills).where(eq(skills.id, input.skillId));
    if (!skill) throw new DomainError(`Неизвестный навык ${input.skillId}`);
    assertSkillScaleValue(skill, input.value);

    const [existing] = await this.db
      .select()
      .from(assessments)
      .where(
        and(
          eq(assessments.assignmentId, input.assignmentId),
          eq(assessments.skillId, input.skillId),
          eq(assessments.assessorUserId, input.assessorUserId),
        ),
      );
    if (existing) {
      await this.db
        .update(assessments)
        .set({ value: input.value, kind: input.kind, updatedAt: new Date() })
        .where(eq(assessments.id, existing.id));
      return (await this.listAssessmentsForAssignment(input.assignmentId)).find((a) => a.id === existing.id)!;
    }
    const id = `assess-${randomUUID()}`;
    await this.db.insert(assessments).values({ id, ...input });
    return (await this.listAssessmentsForAssignment(input.assignmentId)).find((a) => a.id === id)!;
  }
}

export function createAccessRepository(db: ComatrixDb): AccessRepository {
  return new AccessRepository(db);
}
