import type { SystemRole } from '@comatrix/domain';

export interface Session {
  userId: string;
  personId?: string;
  organizationId: string;
  role: SystemRole;
}

export interface AuthProvider {
  /** Resolve a request into a Session, or null when unauthenticated. */
  resolveSession(request: { headers?: { get(name: string): string | null } }, users: { id: string; personId?: string; organizationId: string; role: SystemRole }[]): Session | null;
}

/**
 * Local development auth provider. Resolves the actor from the
 * `x-comatrix-user-id` header (defaulting to the configured dev user) against
 * the in-memory user directory. This is the seam a future OIDC/SSO provider
 * implements.
 */
export class LocalDevAuthProvider implements AuthProvider {
  constructor(private readonly defaultUserId: string) {}

  resolveSession(
    request: { headers?: { get(name: string): string | null } },
    users: { id: string; personId?: string; organizationId: string; role: SystemRole }[],
  ): Session | null {
    const userId = request.headers?.get('x-comatrix-user-id') ?? this.defaultUserId;
    const user = users.find((item) => item.id === userId);
    if (!user) {
      return null;
    }
    return {
      userId: user.id,
      personId: user.personId,
      organizationId: user.organizationId,
      role: user.role,
    };
  }
}

export const DEV_DEFAULT_USER_ID = 'user-alexey';
export const DEFAULT_AUTH_PROVIDER = new LocalDevAuthProvider(DEV_DEFAULT_USER_ID);
