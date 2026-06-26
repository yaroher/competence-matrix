/**
 * Domain invariant / validation failure. Distinct from internal errors so the
 * API layer can surface the message to clients instead of masking it.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export interface Grade {
  id: string;
  name: string;
  sortOrder: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  scaleMin: number;
  scaleMax: number;
  scaleStep: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface SkillScaleMark {
  id: string;
  skillId: string;
  value: number;
  label: string;
  description: string;
  sortOrder: number;
}

export type SkillCatalogNodeKind = 'FOLDER' | 'SKILL';

export interface SkillCatalogNode {
  id: string;
  parentId?: string;
  kind: SkillCatalogNodeKind;
  folderName?: string;
  skillId?: string;
  sortOrder: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface SkillCatalogTreeNode extends SkillCatalogNode {
  children: SkillCatalogTreeNode[];
}

export interface CompetencyRole {
  id: string;
  name: string;
  description: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export interface CompetencyRoleSkill {
  id: string;
  roleId: string;
  skillId: string;
  sortOrder: number;
  isRequired: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleSkillGradeTarget {
  id: string;
  roleSkillId: string;
  gradeId: string;
  targetValue: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogState {
  grades: Grade[];
  skills: Skill[];
  skillScaleMarks: SkillScaleMark[];
  catalogNodes: SkillCatalogNode[];
  competencyRoles: CompetencyRole[];
  roleSkills: CompetencyRoleSkill[];
  roleSkillGradeTargets: RoleSkillGradeTarget[];
}

export function createEmptyCatalogState(): CatalogState {
  return {
    grades: [],
    skills: [],
    skillScaleMarks: [],
    catalogNodes: [],
    competencyRoles: [],
    roleSkills: [],
    roleSkillGradeTargets: [],
  };
}

export function assertSkillScale(skill: Pick<Skill, 'scaleMin' | 'scaleMax' | 'scaleStep'>) {
  if (!Number.isInteger(skill.scaleMin) || !Number.isInteger(skill.scaleMax) || !Number.isInteger(skill.scaleStep)) {
    throw new DomainError('Значения шкалы навыка должны быть целыми числами');
  }
  if (skill.scaleMin >= skill.scaleMax) {
    throw new DomainError('Минимум шкалы должен быть меньше максимума');
  }
  if (skill.scaleStep <= 0) {
    throw new DomainError('Шаг шкалы должен быть положительным');
  }
}

export function assertSkillScaleValue(skill: Pick<Skill, 'scaleMin' | 'scaleMax' | 'scaleStep'>, value: number) {
  assertSkillScale(skill);
  if (!Number.isInteger(value)) {
    throw new DomainError('Целевой уровень должен быть целым числом');
  }
  if (value < skill.scaleMin || value > skill.scaleMax) {
    throw new DomainError(`Целевой уровень ${value} вне диапазона ${skill.scaleMin}..${skill.scaleMax}`);
  }
  if ((value - skill.scaleMin) % skill.scaleStep !== 0) {
    throw new DomainError(`Целевой уровень ${value} не кратен шагу шкалы ${skill.scaleStep}`);
  }
}

export function assertCatalogNodeShape(node: SkillCatalogNode) {
  if (node.kind === 'FOLDER') {
    if (!node.folderName || node.skillId) {
      throw new DomainError('Узлы-папки должны иметь folderName и не иметь skillId');
    }
    return;
  }
  if (!node.skillId || node.folderName) {
    throw new DomainError('Узлы-навыки должны иметь skillId и не иметь folderName');
  }
}

export function buildSkillCatalogTree(nodes: SkillCatalogNode[]): SkillCatalogTreeNode[] {
  const byId = new Map<string, SkillCatalogTreeNode>();
  const roots: SkillCatalogTreeNode[] = [];

  for (const node of nodes) {
    assertCatalogNodeShape(node);
    byId.set(node.id, { ...node, children: [] });
  }

  for (const node of byId.values()) {
    if (!node.parentId) {
      roots.push(node);
      continue;
    }

    const parent = byId.get(node.parentId);
    if (!parent) {
      throw new DomainError(`Неизвестный родительский узел каталога ${node.parentId}`);
    }
    if (parent.kind === 'SKILL') {
      throw new DomainError('Листовые узлы-навыки не могут иметь дочерние элементы');
    }
    parent.children.push(node);
  }

  const bySortOrder = (a: SkillCatalogTreeNode, b: SkillCatalogTreeNode) =>
    a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
  const sortRecursive = (items: SkillCatalogTreeNode[]) => {
    items.sort(bySortOrder);
    for (const item of items) {
      sortRecursive(item.children);
    }
  };
  sortRecursive(roots);

  return roots;
}

export function assertRoleHasSkill(state: CatalogState, roleSkill: Pick<CompetencyRoleSkill, 'roleId' | 'skillId'>) {
  if (!state.competencyRoles.some((role) => role.id === roleSkill.roleId)) {
    throw new DomainError(`Неизвестная роль ${roleSkill.roleId}`);
  }
  if (!state.skills.some((skill) => skill.id === roleSkill.skillId)) {
    throw new DomainError(`Неизвестный навык ${roleSkill.skillId}`);
  }
}

export function assertRoleSkillGradeTarget(
  state: CatalogState,
  input: Pick<RoleSkillGradeTarget, 'roleSkillId' | 'gradeId' | 'targetValue'>,
) {
  const roleSkill = state.roleSkills.find((item) => item.id === input.roleSkillId);
  if (!roleSkill) {
    throw new DomainError(`Неизвестный навык роли ${input.roleSkillId}`);
  }
  if (!state.grades.some((grade) => grade.id === input.gradeId)) {
    throw new DomainError(`Неизвестный грейд ${input.gradeId}`);
  }
  const skill = state.skills.find((item) => item.id === roleSkill.skillId);
  if (!skill) {
    throw new DomainError(`Неизвестный навык ${roleSkill.skillId}`);
  }
  assertSkillScaleValue(skill, input.targetValue);
}
