import { describe, expect, it } from 'vitest';
import type { OrgUnit } from './types.js';
import { buildOrgUnitForest, getSubtreeUnits, hasOrgUnitCycle, wouldCreateCycle } from './org-tree.js';
import { mvpSeed } from './seed.js';

function unit(id: string, parentId: string | undefined, name = id): OrgUnit {
  return {
    id,
    organizationId: 'org-demo',
    parentId,
    type: 'team',
    name,
  };
}

describe('buildOrgUnitForest', () => {
  it('builds a tree from the seed org units', () => {
    const forest = buildOrgUnitForest(mvpSeed.orgUnits);

    expect(forest).toHaveLength(1);
    expect(forest[0].unit.id).toBe('unit-platform');
    expect(forest[0].children.map((child) => child.unit.id).sort()).toEqual(['unit-backend', 'unit-sre']);
  });

  it('treats units with a missing parent as roots', () => {
    const forest = buildOrgUnitForest([unit('a', undefined), unit('b', 'missing')]);

    expect(forest.map((root) => root.unit.id).sort()).toEqual(['a', 'b']);
  });
});

describe('getSubtreeUnits', () => {
  it('returns the whole subtree under the demo department', () => {
    const subtree = getSubtreeUnits('unit-platform', mvpSeed.orgUnits);

    expect(subtree.map((unit) => unit.id).sort()).toEqual(['unit-backend', 'unit-platform', 'unit-sre']);
  });

  it('returns only the root for a leaf unit', () => {
    const subtree = getSubtreeUnits('unit-backend', mvpSeed.orgUnits);

    expect(subtree.map((unit) => unit.id)).toEqual(['unit-backend']);
  });

  it('returns an empty list for an unknown root', () => {
    expect(getSubtreeUnits('nope', mvpSeed.orgUnits)).toEqual([]);
  });
});

describe('hasOrgUnitCycle', () => {
  it('flags a direct self-reference', () => {
    expect(hasOrgUnitCycle([unit('a', 'a')])).toBe(true);
  });

  it('flags a longer cycle', () => {
    expect(hasOrgUnitCycle([unit('a', 'b'), unit('b', 'a')])).toBe(true);
  });

  it('passes for the clean seed tree', () => {
    expect(hasOrgUnitCycle(mvpSeed.orgUnits)).toBe(false);
  });
});

describe('wouldCreateCycle', () => {
  const tree: OrgUnit[] = [unit('root', undefined), unit('child', 'root'), unit('grandchild', 'child')];

  it('blocks self-parenting', () => {
    expect(wouldCreateCycle(tree, 'child', 'child')).toBe(true);
  });

  it('blocks moving a unit under its own descendant', () => {
    expect(wouldCreateCycle(tree, 'root', 'grandchild')).toBe(true);
  });

  it('allows clearing the parent', () => {
    expect(wouldCreateCycle(tree, 'child', undefined)).toBe(false);
  });

  it('allows moving a leaf under an unrelated root', () => {
    expect(wouldCreateCycle(tree, 'grandchild', 'root')).toBe(false);
  });
});
