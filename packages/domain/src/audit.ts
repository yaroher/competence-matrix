import type { AuditAction, AuditEvent, MvpSeed } from './types.js';

export interface AuditActor {
  userId?: string;
  personId?: string;
  organizationId: string;
}

export interface AuditTarget {
  entityType: string;
  entityId: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Append an audit event to the seed and return it. The `action` must be one of
 * the canonical `AuditAction` values; this is the single chokepoint every write
 * mutation must pass through so critical writes always leave a trail with the
 * actor and a timestamp.
 */
export function recordAuditEvent(seed: MvpSeed, actor: AuditActor, action: AuditAction, target: AuditTarget): AuditEvent {
  const event: AuditEvent = {
    id: `audit-${seed.auditEvents.length + 1}-${Date.now()}`,
    organizationId: actor.organizationId,
    actorUserId: actor.userId,
    actorPersonId: actor.personId,
    action,
    entityType: target.entityType,
    entityId: target.entityId,
    summary: target.summary ?? '',
    metadata: target.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
  seed.auditEvents.push(event);
  return event;
}

/** Recent audit events for an entity (newest first). */
export function auditEventsForEntity(seed: MvpSeed, entityType: string, entityId: string, limit = 20): AuditEvent[] {
  return seed.auditEvents
    .filter((event) => event.entityType === entityType && event.entityId === entityId)
    .slice(-limit)
    .reverse();
}
