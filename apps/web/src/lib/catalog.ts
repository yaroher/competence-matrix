import type { CatalogNodeVm, CompetencyRoleVm } from '@/api';

export const CREATED_BY_USER_ID = 'user-admin';
export const SKILL_DND_MIME = 'application/x-comatrix';

export type CatalogTreeNode = CatalogNodeVm & {
  children: CatalogTreeNode[];
};

export type RunAction = (label: string, action: () => Promise<unknown>) => Promise<void>;

function compareNodes(a: CatalogTreeNode, b: CatalogTreeNode) {
  return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
}

/** Nest the flat catalog node list into a sorted folder/skill tree. */
export function buildCatalogTree(nodes: readonly CatalogNodeVm[]): CatalogTreeNode[] {
  const byId = new Map<string, CatalogTreeNode>();
  const roots: CatalogTreeNode[] = [];

  for (const node of nodes) {
    byId.set(node.id, { ...node, children: [] });
  }
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent && parent.kind === 'FOLDER') {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortRecursive = (items: CatalogTreeNode[]) => {
    items.sort(compareNodes);
    items.forEach((item) => sortRecursive(item.children));
  };
  sortRecursive(roots);
  return roots;
}

/** Every skill id at or beneath a catalog node, top-down. */
export function descendantSkillIds(node: CatalogTreeNode): string[] {
  const ids: string[] = [];
  const walk = (current: CatalogTreeNode) => {
    if (current.kind === 'SKILL' && current.skillId) {
      ids.push(current.skillId);
    }
    current.children.forEach(walk);
  };
  walk(node);
  return ids;
}

export function collectFolderIds(roots: readonly CatalogTreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (node: CatalogTreeNode) => {
    if (node.kind === 'FOLDER') {
      ids.push(node.id);
      node.children.forEach(walk);
    }
  };
  roots.forEach(walk);
  return ids;
}

export function skillIdsInRole(role: CompetencyRoleVm | null): Set<string> {
  return new Set((role?.skills ?? []).map((roleSkill) => roleSkill.skillId));
}

export type FolderRef = { id: string; name: string };

/** For every placed skill: its folder path (root → leaf folder), empty if at catalog root. */
export function buildSkillFolderPaths(nodes: readonly CatalogNodeVm[]): Map<string, FolderRef[]> {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const result = new Map<string, FolderRef[]>();
  for (const node of nodes) {
    if (node.kind !== 'SKILL' || !node.skillId) {
      continue;
    }
    const path: FolderRef[] = [];
    let cursor = node.parentId ? byId.get(node.parentId) : undefined;
    const guard = new Set<string>();
    while (cursor && cursor.kind === 'FOLDER' && !guard.has(cursor.id)) {
      guard.add(cursor.id);
      path.unshift({ id: cursor.id, name: cursor.folderName ?? 'Без названия' });
      cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
    }
    result.set(node.skillId, path);
  }
  return result;
}

/** DFS position of each catalog node — used to order row groups exactly as the tree reads. */
export function catalogOrderIndex(nodes: readonly CatalogNodeVm[]): Map<string, number> {
  const roots = buildCatalogTree(nodes);
  const index = new Map<string, number>();
  let counter = 0;
  const walk = (node: CatalogTreeNode) => {
    index.set(node.id, counter++);
    node.children.forEach(walk);
  };
  roots.forEach(walk);
  return index;
}

export function parseRequiredInt(value: string, label: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${label} must be a whole number`);
  }
  return parsed;
}

export function requireText(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required`);
  }
  return trimmed;
}

/** Шкала навыка валидна: целые, min<max, шаг>0 и делит диапазон. */
export function assertScaleBounds(min: number, max: number, step: number) {
  if (![min, max, step].every(Number.isInteger)) {
    throw new Error('Границы шкалы должны быть целыми числами');
  }
  if (min >= max) {
    throw new Error('Минимум шкалы должен быть меньше максимума');
  }
  if (step <= 0) {
    throw new Error('Шаг шкалы должен быть положительным');
  }
  if ((max - min) % step !== 0) {
    throw new Error(`Диапазон ${min}–${max} не делится на шаг ${step}`);
  }
}

/** Значение (метка/цель) попадает в шкалу: целое, в диапазоне, кратно шагу. */
export function isScaleValue(value: number, min: number, max: number, step: number) {
  const safeStep = step > 0 ? step : 1;
  return Number.isInteger(value) && value >= min && value <= max && (value - min) % safeStep === 0;
}

export function assertScaleValue(value: number, min: number, max: number, step: number, label = 'Значение') {
  if (!isScaleValue(value, min, max, step)) {
    throw new Error(`${label} ${value} должно быть целым в диапазоне ${min}–${max}${step !== 1 ? ` с шагом ${step}` : ''}`);
  }
}

export type DragPayload =
  | { type: 'skill'; skillId: string }
  | { type: 'folder'; skillIds: string[] };

export function readDragPayload(transfer: DataTransfer): DragPayload | null {
  const raw = transfer.getData(SKILL_DND_MIME);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as DragPayload;
    if (parsed.type === 'skill' && typeof parsed.skillId === 'string') {
      return parsed;
    }
    if (parsed.type === 'folder' && Array.isArray(parsed.skillIds)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
