import { useCallback, useEffect, useState } from 'react';
import { getToken, loadMe, login, setToken, type Permission, type ViewerVm } from '@/api';

export function useAuth() {
  const [viewer, setViewer] = useState<ViewerVm | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setViewer(null);
      setLoading(false);
      return;
    }
    try {
      setViewer(await loadMe());
    } catch {
      setToken(null);
      setViewer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await login({ email, password });
    setToken(result.token);
    setViewer(result.user as ViewerVm);
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setViewer(null);
  }, []);

  const has = useCallback((permission: Permission) => viewer?.permissions.includes(permission) ?? false, [viewer]);

  return { viewer, loading, signIn, signOut, refresh, has };
}
