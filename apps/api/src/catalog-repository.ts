import {
  competencyRoles,
  competencyRoleSkills,
  grades,
  roleSkillGradeTargets,
  skillCatalogNodes,
  skills,
  skillScaleMarks,
  type ComatrixDb,
} from '@comatrix/db';
import {
  assertSkillScale,
  assertSkillScaleValue,
  type CompetencyRole,
  type CompetencyRoleSkill,
  type Grade,
  type RoleSkillGradeTarget,
  type Skill,
  type SkillCatalogNode,
  type SkillScaleMark,
} from '@comatrix/domain';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';

export interface CreateGradeInput {
  name: string;
  sortOrder?: number | null;
  createdByUserId: string;
}

export interface UpdateGradeInput {
  id: string;
  name?: string | null;
  sortOrder?: number | null;
}

export interface CreateSkillInput {
  name: string;
  description?: string | null;
  scaleMin: number;
  scaleMax: number;
  scaleStep: number;
  createdByUserId: string;
}

export interface UpdateSkillInput {
  id: string;
  name?: string | null;
  description?: string | null;
  scaleMin?: number | null;
  scaleMax?: number | null;
  scaleStep?: number | null;
}

export interface CreateSkillScaleMarkInput {
  skillId: string;
  value: number;
  label: string;
  description?: string | null;
  sortOrder?: number | null;
}

export interface UpdateSkillScaleMarkInput {
  id: string;
  value?: number | null;
  label?: string | null;
  description?: string | null;
  sortOrder?: number | null;
}

export interface DeleteSkillScaleMarkInput {
  id: string;
}

export interface CreateSkillCatalogFolderInput {
  parentId?: string | null;
  name: string;
  sortOrder?: number | null;
  createdByUserId: string;
}

export interface UpdateSkillCatalogFolderInput {
  id: string;
  name?: string | null;
}

export interface PlaceSkillInCatalogInput {
  parentId?: string | null;
  skillId: string;
  sortOrder?: number | null;
  createdByUserId: string;
}

export interface MoveSkillCatalogNodeInput {
  nodeId: string;
  parentId?: string | null;
  sortOrder?: number | null;
}

export interface DeleteSkillCatalogNodeInput {
  id: string;
}

export interface CreateCompetencyRoleInput {
  name: string;
  description?: string | null;
  createdByUserId: string;
}

export interface UpdateCompetencyRoleInput {
  id: string;
  name?: string | null;
  description?: string | null;
}

export interface AddSkillToCompetencyRoleInput {
  roleId: string;
  skillId: string;
  sortOrder?: number | null;
  isRequired?: boolean | null;
  createdByUserId: string;
}

export interface UpdateCompetencyRoleSkillInput {
  id: string;
  sortOrder?: number | null;
  isRequired?: boolean | null;
}

export interface RemoveSkillFromCompetencyRoleInput {
  id: string;
}

export interface SetRoleSkillGradeTargetInput {
  roleSkillId: string;
  gradeId: string;
  targetValue: number;
  createdByUserId: string;
}

export interface CatalogRepository {
  ping(): Promise<void>;
  listGrades(): Promise<Grade[]>;
  getGrade(id: string): Promise<Grade>;
  listSkills(): Promise<Skill[]>;
  getSkill(id: string): Promise<Skill>;
  listSkillScaleMarks(skillId?: string): Promise<SkillScaleMark[]>;
  createGrade(input: CreateGradeInput): Promise<Grade>;
  updateGrade(input: UpdateGradeInput): Promise<Grade>;
  createSkill(input: CreateSkillInput): Promise<Skill>;
  updateSkill(input: UpdateSkillInput): Promise<Skill>;
  createSkillScaleMark(input: CreateSkillScaleMarkInput): Promise<SkillScaleMark>;
  updateSkillScaleMark(input: UpdateSkillScaleMarkInput): Promise<SkillScaleMark>;
  deleteSkillScaleMark(input: DeleteSkillScaleMarkInput): Promise<string>;
  listCatalogNodes(): Promise<SkillCatalogNode[]>;
  getCatalogNode(id: string): Promise<SkillCatalogNode>;
  listCatalogNodeChildren(parentId: string): Promise<SkillCatalogNode[]>;
  getCatalogNodeParent(node: SkillCatalogNode): Promise<SkillCatalogNode | null>;
  getCatalogNodeSkill(node: SkillCatalogNode): Promise<Skill | null>;
  createSkillCatalogFolder(input: CreateSkillCatalogFolderInput): Promise<SkillCatalogNode>;
  updateSkillCatalogFolder(input: UpdateSkillCatalogFolderInput): Promise<SkillCatalogNode>;
  placeSkillInCatalog(input: PlaceSkillInCatalogInput): Promise<SkillCatalogNode>;
  moveSkillCatalogNode(input: MoveSkillCatalogNodeInput): Promise<SkillCatalogNode>;
  deleteSkillCatalogNode(input: DeleteSkillCatalogNodeInput): Promise<string>;
  listCompetencyRoles(): Promise<CompetencyRole[]>;
  getCompetencyRole(id: string): Promise<CompetencyRole>;
  findCompetencyRole(id: string): Promise<CompetencyRole | null>;
  createCompetencyRole(input: CreateCompetencyRoleInput): Promise<CompetencyRole>;
  updateCompetencyRole(input: UpdateCompetencyRoleInput): Promise<CompetencyRole>;
  listCompetencyRoleSkills(roleId: string): Promise<CompetencyRoleSkill[]>;
  getCompetencyRoleSkill(id: string): Promise<CompetencyRoleSkill>;
  createCompetencyRoleSkill(input: AddSkillToCompetencyRoleInput): Promise<CompetencyRoleSkill>;
  updateCompetencyRoleSkill(input: UpdateCompetencyRoleSkillInput): Promise<CompetencyRoleSkill>;
  removeCompetencyRoleSkill(input: RemoveSkillFromCompetencyRoleInput): Promise<string>;
  listRoleSkillGradeTargets(roleSkillId: string): Promise<RoleSkillGradeTarget[]>;
  setRoleSkillGradeTarget(input: SetRoleSkillGradeTargetInput): Promise<RoleSkillGradeTarget>;
}

type GradeRow = typeof grades.$inferSelect;
type SkillRow = typeof skills.$inferSelect;
type SkillScaleMarkRow = typeof skillScaleMarks.$inferSelect;
type SkillCatalogNodeRow = typeof skillCatalogNodes.$inferSelect;
type CompetencyRoleRow = typeof competencyRoles.$inferSelect;
type CompetencyRoleSkillRow = typeof competencyRoleSkills.$inferSelect;
type RoleSkillGradeTargetRow = typeof roleSkillGradeTargets.$inferSelect;

function timestamp(value: Date) {
  return value.toISOString();
}

function nullableTimestamp(value: Date | null) {
  return value?.toISOString();
}

function nullableText(value: string | null) {
  return value ?? undefined;
}

function mapGrade(row: GradeRow): Grade {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
    createdByUserId: row.createdByUserId,
    createdAt: timestamp(row.createdAt),
    updatedAt: timestamp(row.updatedAt),
    archivedAt: nullableTimestamp(row.archivedAt),
  };
}

function mapSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    scaleMin: row.scaleMin,
    scaleMax: row.scaleMax,
    scaleStep: row.scaleStep,
    createdByUserId: row.createdByUserId,
    createdAt: timestamp(row.createdAt),
    updatedAt: timestamp(row.updatedAt),
    archivedAt: nullableTimestamp(row.archivedAt),
  };
}

function mapSkillScaleMark(row: SkillScaleMarkRow): SkillScaleMark {
  return {
    id: row.id,
    skillId: row.skillId,
    value: row.value,
    label: row.label,
    description: row.description,
    sortOrder: row.sortOrder,
  };
}

function mapCatalogNode(row: SkillCatalogNodeRow): SkillCatalogNode {
  return {
    id: row.id,
    parentId: nullableText(row.parentId),
    kind: row.kind,
    folderName: nullableText(row.folderName),
    skillId: nullableText(row.skillId),
    sortOrder: row.sortOrder,
    createdByUserId: row.createdByUserId,
    createdAt: timestamp(row.createdAt),
    updatedAt: timestamp(row.updatedAt),
    archivedAt: nullableTimestamp(row.archivedAt),
  };
}

function mapCompetencyRole(row: CompetencyRoleRow): CompetencyRole {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdByUserId: row.createdByUserId,
    createdAt: timestamp(row.createdAt),
    updatedAt: timestamp(row.updatedAt),
    archivedAt: nullableTimestamp(row.archivedAt),
  };
}

function mapCompetencyRoleSkill(row: CompetencyRoleSkillRow): CompetencyRoleSkill {
  return {
    id: row.id,
    roleId: row.roleId,
    skillId: row.skillId,
    sortOrder: row.sortOrder,
    isRequired: row.isRequired,
    createdByUserId: row.createdByUserId,
    createdAt: timestamp(row.createdAt),
    updatedAt: timestamp(row.updatedAt),
  };
}

function mapRoleSkillGradeTarget(row: RoleSkillGradeTargetRow): RoleSkillGradeTarget {
  return {
    id: row.id,
    roleSkillId: row.roleSkillId,
    gradeId: row.gradeId,
    targetValue: row.targetValue,
    createdByUserId: row.createdByUserId,
    createdAt: timestamp(row.createdAt),
    updatedAt: timestamp(row.updatedAt),
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function createId(prefix: string, value: string, existingIds: Set<string>) {
  const base = `${prefix}-${slugify(value) || 'item'}`;
  let next = base;
  let counter = 2;
  while (existingIds.has(next)) {
    next = `${base}-${counter}`;
    counter += 1;
  }
  return next;
}

function requireRow<T>(row: T | undefined, entity: string, id: string): T {
  if (!row) {
    throw new Error(`Unknown ${entity} ${id}`);
  }
  return row;
}

function requireInserted<T>(row: T | undefined, entity: string): T {
  if (!row) {
    throw new Error(`Failed to persist ${entity}`);
  }
  return row;
}

function parentPredicate(parentId?: string) {
  return parentId ? eq(skillCatalogNodes.parentId, parentId) : isNull(skillCatalogNodes.parentId);
}

function assertPositiveSortOrder(value: number, entity: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${entity} sort order must be a non-negative integer`);
  }
}

export function createDrizzleCatalogRepository(db: ComatrixDb): CatalogRepository {
  return new DrizzleCatalogRepository(db);
}

class DrizzleCatalogRepository implements CatalogRepository {
  constructor(private readonly db: ComatrixDb) {}

  async ping() {
    await this.db.execute(sql`select 1`);
  }

  async listGrades() {
    const rows = await this.db.select().from(grades).orderBy(asc(grades.sortOrder), asc(grades.id));
    return rows.map(mapGrade);
  }

  async getGrade(id: string) {
    const [row] = await this.db.select().from(grades).where(eq(grades.id, id));
    return mapGrade(requireRow(row, 'grade', id));
  }

  async listSkills() {
    const rows = await this.db.select().from(skills).orderBy(asc(skills.name), asc(skills.id));
    return rows.map(mapSkill);
  }

  async getSkill(id: string) {
    const [row] = await this.db.select().from(skills).where(eq(skills.id, id));
    return mapSkill(requireRow(row, 'skill', id));
  }

  async listSkillScaleMarks(skillId?: string) {
    const query = this.db.select().from(skillScaleMarks).orderBy(asc(skillScaleMarks.sortOrder), asc(skillScaleMarks.id));
    const rows = skillId ? await query.where(eq(skillScaleMarks.skillId, skillId)) : await query;
    return rows.map(mapSkillScaleMark);
  }

  private async getSkillScaleMark(id: string) {
    const [row] = await this.db.select().from(skillScaleMarks).where(eq(skillScaleMarks.id, id));
    return mapSkillScaleMark(requireRow(row, 'skill scale mark', id));
  }

  async createGrade(input: CreateGradeInput) {
    const existingIds = new Set((await this.db.select({ id: grades.id }).from(grades)).map((row) => row.id));
    const sortOrder = input.sortOrder ?? (await this.listGrades()).length + 1;
    assertPositiveSortOrder(sortOrder, 'Grade');
    const [row] = await this.db
      .insert(grades)
      .values({
        id: createId('grade', input.name, existingIds),
        name: input.name,
        sortOrder,
        createdByUserId: input.createdByUserId,
      })
      .returning();
    return mapGrade(requireInserted(row, 'grade'));
  }

  async updateGrade(input: UpdateGradeInput) {
    const grade = await this.getGrade(input.id);
    const sortOrder = input.sortOrder ?? grade.sortOrder;
    assertPositiveSortOrder(sortOrder, 'Grade');
    const [row] = await this.db
      .update(grades)
      .set({
        name: input.name ?? grade.name,
        sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(grades.id, grade.id))
      .returning();
    return mapGrade(requireInserted(row, 'grade'));
  }

  async createSkill(input: CreateSkillInput) {
    assertSkillScale(input);
    const existingIds = new Set((await this.db.select({ id: skills.id }).from(skills)).map((row) => row.id));
    const [row] = await this.db
      .insert(skills)
      .values({
        id: createId('skill', input.name, existingIds),
        name: input.name,
        description: input.description ?? '',
        scaleMin: input.scaleMin,
        scaleMax: input.scaleMax,
        scaleStep: input.scaleStep,
        createdByUserId: input.createdByUserId,
      })
      .returning();
    return mapSkill(requireInserted(row, 'skill'));
  }

  async updateSkill(input: UpdateSkillInput) {
    const skill = await this.getSkill(input.id);
    const nextSkill: Skill = {
      ...skill,
      name: input.name ?? skill.name,
      description: input.description ?? skill.description,
      scaleMin: input.scaleMin ?? skill.scaleMin,
      scaleMax: input.scaleMax ?? skill.scaleMax,
      scaleStep: input.scaleStep ?? skill.scaleStep,
    };
    assertSkillScale(nextSkill);

    for (const mark of await this.listSkillScaleMarks(skill.id)) {
      assertSkillScaleValue(nextSkill, mark.value);
    }

    const roleSkills = await this.db
      .select()
      .from(competencyRoleSkills)
      .where(eq(competencyRoleSkills.skillId, skill.id));
    for (const roleSkill of roleSkills) {
      for (const target of await this.listRoleSkillGradeTargets(roleSkill.id)) {
        assertSkillScaleValue(nextSkill, target.targetValue);
      }
    }

    const [row] = await this.db
      .update(skills)
      .set({
        name: nextSkill.name,
        description: nextSkill.description,
        scaleMin: nextSkill.scaleMin,
        scaleMax: nextSkill.scaleMax,
        scaleStep: nextSkill.scaleStep,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skill.id))
      .returning();
    return mapSkill(requireInserted(row, 'skill'));
  }

  async createSkillScaleMark(input: CreateSkillScaleMarkInput) {
    const skill = await this.getSkill(input.skillId);
    assertSkillScaleValue(skill, input.value);
    const existingIds = new Set((await this.db.select({ id: skillScaleMarks.id }).from(skillScaleMarks)).map((row) => row.id));
    const sortOrder = input.sortOrder ?? (await this.listSkillScaleMarks(skill.id)).length + 1;
    assertPositiveSortOrder(sortOrder, 'Skill scale mark');
    const [row] = await this.db
      .insert(skillScaleMarks)
      .values({
        id: createId('mark', `${skill.name}-${input.label}`, existingIds),
        skillId: skill.id,
        value: input.value,
        label: input.label,
        description: input.description ?? '',
        sortOrder,
      })
      .returning();
    return mapSkillScaleMark(requireInserted(row, 'skill scale mark'));
  }

  async updateSkillScaleMark(input: UpdateSkillScaleMarkInput) {
    const mark = await this.getSkillScaleMark(input.id);
    const skill = await this.getSkill(mark.skillId);
    const value = input.value ?? mark.value;
    const sortOrder = input.sortOrder ?? mark.sortOrder;
    assertSkillScaleValue(skill, value);
    assertPositiveSortOrder(sortOrder, 'Skill scale mark');
    const [row] = await this.db
      .update(skillScaleMarks)
      .set({
        value,
        label: input.label ?? mark.label,
        description: input.description ?? mark.description,
        sortOrder,
      })
      .where(eq(skillScaleMarks.id, mark.id))
      .returning();
    return mapSkillScaleMark(requireInserted(row, 'skill scale mark'));
  }

  async deleteSkillScaleMark(input: DeleteSkillScaleMarkInput) {
    const mark = await this.getSkillScaleMark(input.id);
    await this.db.delete(skillScaleMarks).where(eq(skillScaleMarks.id, mark.id));
    return mark.id;
  }

  async listCatalogNodes() {
    const rows = await this.db
      .select()
      .from(skillCatalogNodes)
      .orderBy(asc(skillCatalogNodes.sortOrder), asc(skillCatalogNodes.id));
    return rows.map(mapCatalogNode);
  }

  async getCatalogNode(id: string) {
    const [row] = await this.db.select().from(skillCatalogNodes).where(eq(skillCatalogNodes.id, id));
    return mapCatalogNode(requireRow(row, 'catalog node', id));
  }

  async listCatalogNodeChildren(parentId: string) {
    const rows = await this.db
      .select()
      .from(skillCatalogNodes)
      .where(eq(skillCatalogNodes.parentId, parentId))
      .orderBy(asc(skillCatalogNodes.sortOrder), asc(skillCatalogNodes.id));
    return rows.map(mapCatalogNode);
  }

  async getCatalogNodeParent(node: SkillCatalogNode) {
    return node.parentId ? this.getCatalogNode(node.parentId) : null;
  }

  async getCatalogNodeSkill(node: SkillCatalogNode) {
    return node.skillId ? this.getSkill(node.skillId) : null;
  }

  async createSkillCatalogFolder(input: CreateSkillCatalogFolderInput) {
    const parentId = input.parentId ?? undefined;
    await this.assertFolderParent(parentId);
    const existingIds = new Set((await this.db.select({ id: skillCatalogNodes.id }).from(skillCatalogNodes)).map((row) => row.id));
    const sortOrder = input.sortOrder ?? (await this.countCatalogSiblings(parentId)) + 1;
    assertPositiveSortOrder(sortOrder, 'Catalog node');
    const [row] = await this.db
      .insert(skillCatalogNodes)
      .values({
        id: createId('node', input.name, existingIds),
        parentId,
        kind: 'FOLDER',
        folderName: input.name,
        sortOrder,
        createdByUserId: input.createdByUserId,
      })
      .returning();
    return mapCatalogNode(requireInserted(row, 'catalog folder'));
  }

  async updateSkillCatalogFolder(input: UpdateSkillCatalogFolderInput) {
    const node = await this.getCatalogNode(input.id);
    if (node.kind !== 'FOLDER') {
      throw new Error('Only catalog folders can be renamed');
    }
    const folderName = input.name ?? node.folderName;
    if (!folderName) {
      throw new Error('Catalog folder name is required');
    }
    const [row] = await this.db
      .update(skillCatalogNodes)
      .set({
        folderName,
        updatedAt: new Date(),
      })
      .where(eq(skillCatalogNodes.id, node.id))
      .returning();
    return mapCatalogNode(requireInserted(row, 'catalog folder'));
  }

  async placeSkillInCatalog(input: PlaceSkillInCatalogInput) {
    const parentId = input.parentId ?? undefined;
    await this.assertFolderParent(parentId);
    const skill = await this.getSkill(input.skillId);
    const [existing] = await this.db.select().from(skillCatalogNodes).where(eq(skillCatalogNodes.skillId, skill.id));
    if (existing) {
      throw new Error(`Skill ${skill.id} is already placed in the catalog`);
    }

    const existingIds = new Set((await this.db.select({ id: skillCatalogNodes.id }).from(skillCatalogNodes)).map((row) => row.id));
    const sortOrder = input.sortOrder ?? (await this.countCatalogSiblings(parentId)) + 1;
    assertPositiveSortOrder(sortOrder, 'Catalog node');
    const [row] = await this.db
      .insert(skillCatalogNodes)
      .values({
        id: createId('node', skill.name, existingIds),
        parentId,
        kind: 'SKILL',
        skillId: skill.id,
        sortOrder,
        createdByUserId: input.createdByUserId,
      })
      .returning();
    return mapCatalogNode(requireInserted(row, 'catalog skill node'));
  }

  async moveSkillCatalogNode(input: MoveSkillCatalogNodeInput) {
    const node = await this.getCatalogNode(input.nodeId);
    const parentId = input.parentId ?? undefined;
    await this.assertFolderParent(parentId, node.id);
    const sortOrder = input.sortOrder ?? node.sortOrder;
    assertPositiveSortOrder(sortOrder, 'Catalog node');
    const [row] = await this.db
      .update(skillCatalogNodes)
      .set({
        parentId: parentId ?? null,
        sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(skillCatalogNodes.id, node.id))
      .returning();
    return mapCatalogNode(requireInserted(row, 'catalog node'));
  }

  /**
   * Delete a catalog node. For a folder: removes the whole subtree (nested
   * folders + skill placements) and the skills it contains. For a skill node:
   * removes the skill entirely. Affected skills are detached from every matrix
   * (their role memberships + grade targets are removed too).
   */
  async deleteSkillCatalogNode(input: DeleteSkillCatalogNodeInput) {
    const node = await this.getCatalogNode(input.id);
    const allNodes = await this.db.select().from(skillCatalogNodes);

    const childrenByParent = new Map<string, SkillCatalogNodeRow[]>();
    for (const row of allNodes) {
      if (!row.parentId) {
        continue;
      }
      const list = childrenByParent.get(row.parentId) ?? [];
      list.push(row);
      childrenByParent.set(row.parentId, list);
    }

    // Collect the node + every descendant.
    const subtree: SkillCatalogNodeRow[] = [];
    const stack = [node as unknown as SkillCatalogNodeRow];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || seen.has(current.id)) {
        continue;
      }
      seen.add(current.id);
      subtree.push(current);
      (childrenByParent.get(current.id) ?? []).forEach((child) => stack.push(child));
    }

    const nodeIds = subtree.map((row) => row.id);
    const skillIds = [...new Set(subtree.filter((row) => row.kind === 'SKILL' && row.skillId).map((row) => row.skillId as string))];

    // Order matters: skillId/parentId FKs are RESTRICT, so clear dependents first.
    if (skillIds.length > 0) {
      await this.db.delete(competencyRoleSkills).where(inArray(competencyRoleSkills.skillId, skillIds));
    }
    if (nodeIds.length > 0) {
      await this.db.delete(skillCatalogNodes).where(inArray(skillCatalogNodes.id, nodeIds));
    }
    if (skillIds.length > 0) {
      await this.db.delete(skills).where(inArray(skills.id, skillIds));
    }
    return node.id;
  }

  async listCompetencyRoles() {
    const rows = await this.db.select().from(competencyRoles).orderBy(asc(competencyRoles.name), asc(competencyRoles.id));
    return rows.map(mapCompetencyRole);
  }

  async getCompetencyRole(id: string) {
    const row = await this.findCompetencyRole(id);
    if (!row) {
      throw new Error(`Unknown competency role ${id}`);
    }
    return row;
  }

  async findCompetencyRole(id: string) {
    const [row] = await this.db.select().from(competencyRoles).where(eq(competencyRoles.id, id));
    return row ? mapCompetencyRole(row) : null;
  }

  async createCompetencyRole(input: CreateCompetencyRoleInput) {
    const existingIds = new Set((await this.db.select({ id: competencyRoles.id }).from(competencyRoles)).map((row) => row.id));
    const [row] = await this.db
      .insert(competencyRoles)
      .values({
        id: createId('role', input.name, existingIds),
        name: input.name,
        description: input.description ?? '',
        createdByUserId: input.createdByUserId,
      })
      .returning();
    return mapCompetencyRole(requireInserted(row, 'competency role'));
  }

  async updateCompetencyRole(input: UpdateCompetencyRoleInput) {
    const role = await this.getCompetencyRole(input.id);
    const [row] = await this.db
      .update(competencyRoles)
      .set({
        name: input.name ?? role.name,
        description: input.description ?? role.description,
        updatedAt: new Date(),
      })
      .where(eq(competencyRoles.id, role.id))
      .returning();
    return mapCompetencyRole(requireInserted(row, 'competency role'));
  }

  async listCompetencyRoleSkills(roleId: string) {
    const rows = await this.db
      .select()
      .from(competencyRoleSkills)
      .where(eq(competencyRoleSkills.roleId, roleId))
      .orderBy(asc(competencyRoleSkills.sortOrder), asc(competencyRoleSkills.id));
    return rows.map(mapCompetencyRoleSkill);
  }

  async getCompetencyRoleSkill(id: string) {
    const [row] = await this.db.select().from(competencyRoleSkills).where(eq(competencyRoleSkills.id, id));
    return mapCompetencyRoleSkill(requireRow(row, 'role skill', id));
  }

  async createCompetencyRoleSkill(input: AddSkillToCompetencyRoleInput) {
    const role = await this.getCompetencyRole(input.roleId);
    const skill = await this.getSkill(input.skillId);
    const [existing] = await this.db
      .select()
      .from(competencyRoleSkills)
      .where(and(eq(competencyRoleSkills.roleId, role.id), eq(competencyRoleSkills.skillId, skill.id)));
    if (existing) {
      throw new Error(`Skill ${skill.id} is already in role ${role.id}`);
    }

    const existingIds = new Set((await this.db.select({ id: competencyRoleSkills.id }).from(competencyRoleSkills)).map((row) => row.id));
    const sortOrder = input.sortOrder ?? (await this.listCompetencyRoleSkills(role.id)).length + 1;
    assertPositiveSortOrder(sortOrder, 'Role skill');
    const [row] = await this.db
      .insert(competencyRoleSkills)
      .values({
        id: createId('role-skill', `${role.name}-${skill.name}`, existingIds),
        roleId: role.id,
        skillId: skill.id,
        sortOrder,
        isRequired: input.isRequired ?? true,
        createdByUserId: input.createdByUserId,
      })
      .returning();
    return mapCompetencyRoleSkill(requireInserted(row, 'role skill'));
  }

  async updateCompetencyRoleSkill(input: UpdateCompetencyRoleSkillInput) {
    const roleSkill = await this.getCompetencyRoleSkill(input.id);
    const sortOrder = input.sortOrder ?? roleSkill.sortOrder;
    assertPositiveSortOrder(sortOrder, 'Role skill');
    const [row] = await this.db
      .update(competencyRoleSkills)
      .set({
        sortOrder,
        isRequired: input.isRequired ?? roleSkill.isRequired,
        updatedAt: new Date(),
      })
      .where(eq(competencyRoleSkills.id, roleSkill.id))
      .returning();
    return mapCompetencyRoleSkill(requireInserted(row, 'role skill'));
  }

  async removeCompetencyRoleSkill(input: RemoveSkillFromCompetencyRoleInput) {
    const roleSkill = await this.getCompetencyRoleSkill(input.id);
    // grade targets cascade on delete via the FK constraint.
    await this.db.delete(competencyRoleSkills).where(eq(competencyRoleSkills.id, roleSkill.id));
    return roleSkill.id;
  }

  async listRoleSkillGradeTargets(roleSkillId: string) {
    const rows = await this.db
      .select()
      .from(roleSkillGradeTargets)
      .where(eq(roleSkillGradeTargets.roleSkillId, roleSkillId))
      .orderBy(asc(roleSkillGradeTargets.id));
    return rows.map(mapRoleSkillGradeTarget);
  }

  async setRoleSkillGradeTarget(input: SetRoleSkillGradeTargetInput) {
    const roleSkill = await this.getCompetencyRoleSkill(input.roleSkillId);
    await this.getGrade(input.gradeId);
    const skill = await this.getSkill(roleSkill.skillId);
    assertSkillScaleValue(skill, input.targetValue);

    const [existing] = await this.db
      .select()
      .from(roleSkillGradeTargets)
      .where(and(eq(roleSkillGradeTargets.roleSkillId, roleSkill.id), eq(roleSkillGradeTargets.gradeId, input.gradeId)));
    if (existing) {
      const [row] = await this.db
        .update(roleSkillGradeTargets)
        .set({
          targetValue: input.targetValue,
          updatedAt: new Date(),
        })
        .where(eq(roleSkillGradeTargets.id, existing.id))
        .returning();
      return mapRoleSkillGradeTarget(requireInserted(row, 'role skill grade target'));
    }

    const grade = await this.getGrade(input.gradeId);
    const existingIds = new Set((await this.db.select({ id: roleSkillGradeTargets.id }).from(roleSkillGradeTargets)).map((row) => row.id));
    const [row] = await this.db
      .insert(roleSkillGradeTargets)
      .values({
        id: createId('target', `${roleSkill.id}-${grade.id}`, existingIds),
        roleSkillId: roleSkill.id,
        gradeId: grade.id,
        targetValue: input.targetValue,
        createdByUserId: input.createdByUserId,
      })
      .returning();
    return mapRoleSkillGradeTarget(requireInserted(row, 'role skill grade target'));
  }

  private async countCatalogSiblings(parentId?: string) {
    const rows = await this.db.select({ id: skillCatalogNodes.id }).from(skillCatalogNodes).where(parentPredicate(parentId));
    return rows.length;
  }

  private async assertFolderParent(parentId?: string, movedNodeId?: string) {
    if (!parentId) {
      return;
    }
    if (parentId === movedNodeId) {
      throw new Error('Catalog nodes cannot be moved under themselves');
    }

    const parent = await this.getCatalogNode(parentId);
    if (parent.kind === 'SKILL') {
      throw new Error('Skill catalog leaf nodes cannot have children');
    }

    const nodes = await this.listCatalogNodes();
    let next = parent.parentId;
    while (next) {
      if (next === movedNodeId) {
        throw new Error('Catalog nodes cannot be moved under their descendants');
      }
      next = nodes.find((node) => node.id === next)?.parentId;
    }
  }
}
