import { sql } from 'drizzle-orm';
import type { OrgUnit } from '@comatrix/domain';
import { orgUnits } from './schema.js';
import type { ComatrixDb } from './client.js';

interface OrgUnitRow {
  id: string;
  organizationId: string;
  parentId: string | null;
  type: string;
  name: string;
  status: string;
}

interface OrgUnitSqlRow {
  id: string;
  organization_id: string;
  parent_id: string | null;
  type: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

function toOrgUnit(row: OrgUnitRow): OrgUnit {
  return {
    id: row.id,
    organizationId: row.organizationId,
    parentId: row.parentId ?? undefined,
    type: row.type as OrgUnit['type'],
    name: row.name,
    status: row.status as OrgUnit['status'],
  };
}

/**
 * Load every org unit for an organization as a flat list. Consumers build the
 * tree shape with {@link buildOrgUnitForest} from `@comatrix/domain`.
 */
export async function loadOrganizationUnits(db: ComatrixDb, organizationId: string): Promise<OrgUnit[]> {
  const rows = await db
    .select({
      id: orgUnits.id,
      organizationId: orgUnits.organizationId,
      parentId: orgUnits.parentId,
      type: orgUnits.type,
      name: orgUnits.name,
      status: orgUnits.status,
    })
    .from(orgUnits)
    .where(sql`${orgUnits.organizationId} = ${organizationId}`);

  return rows.map((row) => toOrgUnit(row as OrgUnitRow));
}

/**
 * Load a single org unit by id. Returns `undefined` when the unit does not exist.
 */
export async function findOrgUnit(db: ComatrixDb, orgUnitId: string): Promise<OrgUnit | undefined> {
  const rows = await db
    .select({
      id: orgUnits.id,
      organizationId: orgUnits.organizationId,
      parentId: orgUnits.parentId,
      type: orgUnits.type,
      name: orgUnits.name,
      status: orgUnits.status,
    })
    .from(orgUnits)
    .where(sql`${orgUnits.id} = ${orgUnitId}`)
    .limit(1);

  const row = rows[0] as OrgUnitRow | undefined;
  return row ? toOrgUnit(row) : undefined;
}

/**
 * Load the subtree rooted at `rootId` (inclusive) using a recursive CTE. Returns
 * a flat list; the root is the first element. An unknown `rootId` yields an
 * empty array. The recursive CTE tracks visited ids, so cycles in the data
 * cannot infinite-loop the query.
 */
export async function loadOrgUnitSubtree(db: ComatrixDb, rootId: string): Promise<OrgUnit[]> {
  const result = await db.execute<OrgUnitSqlRow>(sql`
    WITH RECURSIVE subtree AS (
      SELECT id, organization_id, parent_id, type, name, status
      FROM org_units
      WHERE id = ${rootId}
      UNION
      SELECT child.id, child.organization_id, child.parent_id, child.type, child.name, child.status
      FROM org_units AS child
      JOIN subtree ON child.parent_id = subtree.id
    )
    SELECT id, organization_id, parent_id, type, name, status
    FROM subtree
  `);

  const rows = (Array.isArray(result) ? (result as OrgUnitSqlRow[]) : result.rows) ?? [];
  return rows.map((row) =>
    toOrgUnit({
      id: row.id,
      organizationId: row.organization_id,
      parentId: row.parent_id,
      type: row.type,
      name: row.name,
      status: row.status,
    }),
  );
}
