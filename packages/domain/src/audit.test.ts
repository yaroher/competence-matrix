import { describe, expect, it } from 'vitest';
import { mvpSeed } from './seed.js';
import { auditEventsForEntity, recordAuditEvent } from './audit.js';

describe('recordAuditEvent', () => {
  it('appends an audit event with actor and timestamp to the seed', () => {
    const seed = structuredClone(mvpSeed);
    const before = seed.auditEvents.length;
    const event = recordAuditEvent(seed, { userId: 'user-marina', organizationId: 'org-demo' }, 'assessment_finalized', {
      entityType: 'assessment',
      entityId: 'assessment-alexey-backend-go-senior',
      summary: 'Finalized assessment',
      metadata: { source: 'test' },
    });

    expect(seed.auditEvents.length).toBe(before + 1);
    expect(event.actorUserId).toBe('user-marina');
    expect(event.action).toBe('assessment_finalized');
    expect(event.createdAt).toBeTruthy();
    expect(event.metadata).toEqual({ source: 'test' });
  });

  it('is the chokepoint mutations rely on — removing the call loses the trail', () => {
    const seed = structuredClone(mvpSeed);
    const events = auditEventsForEntity(seed, 'assessment', 'assessment-alexey-backend-go-senior');
    expect(events).toEqual([]);

    recordAuditEvent(seed, { userId: 'user-marina', organizationId: 'org-demo' }, 'assessment_finalized', {
      entityType: 'assessment',
      entityId: 'assessment-alexey-backend-go-senior',
    });
    const after = auditEventsForEntity(seed, 'assessment', 'assessment-alexey-backend-go-senior');
    expect(after).toHaveLength(1);
    expect(after[0].action).toBe('assessment_finalized');
  });
});
