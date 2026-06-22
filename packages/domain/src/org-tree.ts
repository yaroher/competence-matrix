import type { OrgUnit } from './types.js';

export interface OrgUnitNode {
  unit: OrgUnit;
  children: OrgUnitNode[];
}

/**
 * Build a forest of org units from a flat list. Units whose parentId does not
 * exist in the set become roots. Cycles, if present, are broken by treating the
 * offending unit as a root (see {@link hasOrgUnitCycle} to detect them).
 */
export function buildOrgUnitForest(units: OrgUnit[]): OrgUnitNode[] {
  const byId = new Map<string, OrgUnit>();
  for (const unit of units) {
    byId.set(unit.id, unit);
  }

  const nodes = new Map<string, OrgUnitNode>();
  for (const unit of units) {
    nodes.set(unit.id, { unit, children: [] });
  }

  const roots: OrgUnitNode[] = [];
  for (const unit of units) {
    const node = nodes.get(unit.id);
    if (!node) {
      continue;
    }
    const parent = unit.parentId ? nodes.get(unit.parentId) : undefined;
    if (parent && unit.parentId !== unit.id) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  void byId;
  return roots;
}

/**
 * Returns the root id and every descendant of the root, in depth-first order.
 * The root itself is included as the first element. Unknown `rootId` returns an
 * empty array.
 */
export function getSubtreeUnits(rootId: string, units: OrgUnit[]): OrgUnit[] {
  const childrenOf = new Map<string, OrgUnit[]>();
  for (const unit of units) {
    if (!unit.parentId || unit.parentId === unit.id) {
      continue;
    }
    const list = childrenOf.get(unit.parentId) ?? [];
    list.push(unit);
    childrenOf.set(unit.parentId, list);
  }

  const root = units.find((unit) => unit.id === rootId);
  if (!root) {
    return [];
  }

  const result: OrgUnit[] = [root];
  const stack = [rootId];
  const visited = new Set<string>([rootId]);
  while (stack.length > 0) {
    const current = stack.pop()!;
    const children = childrenOf.get(current) ?? [];
    for (const child of children) {
      if (visited.has(child.id)) {
        continue;
      }
      visited.add(child.id);
      result.push(child);
      stack.push(child.id);
    }
  }

  return result;
}

/**
 * Returns true when following parent pointers from any unit eventually loops
 * back to a previously visited unit (including a direct self-reference).
 */
export function hasOrgUnitCycle(units: OrgUnit[]): boolean {
  const byId = new Map<string, OrgUnit>(units.map((unit) => [unit.id, unit]));
  for (const unit of units) {
    const seen = new Set<string>();
    let current: OrgUnit | undefined = unit;
    while (current && current.parentId) {
      if (current.parentId === current.id) {
        return true;
      }
      if (seen.has(current.id)) {
        return true;
      }
      seen.add(current.id);
      current = byId.get(current.parentId);
    }
  }
  return false;
}

/**
 * Guard for reparenting. Returns true if assigning `newParentId` as the parent
 * of `unitId` would create a cycle (i.e. `newParentId` is `unitId` itself or a
 * descendant of `unitId`). `newParentId === null/undefined` never cycles.
 */
export function wouldCreateCycle(units: OrgUnit[], unitId: string, newParentId: string | null | undefined): boolean {
  if (!newParentId) {
    return false;
  }
  if (newParentId === unitId) {
    return true;
  }
  const descendants = new Set(getSubtreeUnits(unitId, units).map((unit) => unit.id));
  return descendants.has(newParentId);
}
