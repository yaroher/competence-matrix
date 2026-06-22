import { describe, expect, it } from 'vitest';
import { mvpSeed } from './seed.js';

describe('mvpSeed users', () => {
  it('provides one user per required persona', () => {
    const roles = new Set(mvpSeed.users.map((user) => user.role));
    expect(roles).toEqual(
      new Set(['employee', 'manager', 'expert', 'hr', 'methodology_admin']),
    );
    expect(mvpSeed.users).toHaveLength(5);
  });

  it('binds every user to a real person', () => {
    const personIds = new Set(mvpSeed.people.map((person) => person.id));
    for (const user of mvpSeed.users) {
      expect(user.personId, `user ${user.id} should bind to a person`).toBeTruthy();
      expect(personIds.has(user.personId!), `user ${user.id} -> unknown person ${user.personId}`).toBe(true);
    }
  });
});
