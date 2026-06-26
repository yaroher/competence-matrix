import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'comatrix-theme';

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(pref: ThemePreference) {
  return pref === 'system' ? prefersDark() : pref === 'dark';
}

function readStored(): ThemePreference {
  if (typeof localStorage === 'undefined') {
    return 'dark';
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'dark';
}

/** Theme preference persisted to localStorage; toggles `.dark` on <html>. */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readStored);

  useEffect(() => {
    const isDark = resolve(preference);
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    if (preference !== 'system') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => document.documentElement.classList.toggle('dark', media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => setPreference(next), []);

  return { preference, isDark: resolve(preference), setTheme };
}
