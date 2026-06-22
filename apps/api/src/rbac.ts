import { createGraphQLError } from 'graphql-yoga';
import type { SystemRole } from '@comatrix/domain';
import type { Session } from './auth.js';

export type Permission =
  | 'person.write'
  | 'assignment.write'
  | 'methodology.write'
  | 'assessment.finalize'
  | 'matrix.activate'
  | 'analytics.read'
  | 'ontology.read';

const PERMISSION_MATRIX: Record<Permission, SystemRole[]> = {
  'person.write': ['hr', 'methodology_admin'],
  'assignment.write': ['hr', 'methodology_admin'],
  'methodology.write': ['methodology_admin'],
  'assessment.finalize': ['manager', 'hr', 'methodology_admin'],
  'matrix.activate': ['hr', 'methodology_admin'],
  'analytics.read': ['manager', 'hr', 'methodology_admin'],
  'ontology.read': ['employee', 'manager', 'expert', 'hr', 'methodology_admin'],
};

export function can(session: Session, permission: Permission): boolean {
  return PERMISSION_MATRIX[permission].includes(session.role);
}

export function requirePermission(session: Session, permission: Permission): void {
  if (!can(session, permission)) {
    throw createGraphQLError(`Role "${session.role}" is not allowed to perform "${permission}"`, {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}
