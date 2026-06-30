import { useMemo, useState, type ReactNode } from 'react';
import { Boxes, LogOut, Moon, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { LoginScreen } from '@/components/login-screen';
import { AssessmentsView } from '@/components/assessments-view';
import { AdminView } from '@/components/admin-view';
import { BuilderApp } from './App';

type ViewKey = 'builder' | 'assess' | 'admin';

export function App() {
  const { viewer, loading, signIn, signOut, has } = useAuth();
  const { isDark, setTheme } = useTheme();
  const [view, setView] = useState<ViewKey | null>(null);

  const nav = useMemo(() => {
    if (!viewer) return [] as { key: ViewKey; label: string }[];
    const items: { key: ViewKey; label: string }[] = [];
    if (has('MANAGE_CATALOG') || has('MANAGE_MATRICES')) items.push({ key: 'builder', label: 'Конструктор' });
    items.push({ key: 'assess', label: 'Оценка' });
    if (has('MANAGE_ORG') || has('ASSIGN_MATRICES') || has('MANAGE_USERS_ROLES')) items.push({ key: 'admin', label: 'Администрирование' });
    return items;
  }, [viewer, has]);

  if (loading) {
    return <div className="grid h-dvh place-items-center bg-[var(--background-2)] text-sm text-muted-foreground">Загрузка…</div>;
  }
  if (!viewer) {
    return (
      <TooltipProvider>
        <LoginScreen onSignIn={signIn} />
      </TooltipProvider>
    );
  }

  const active: ViewKey = view && nav.some((n) => n.key === view) ? view : nav[0]?.key ?? 'assess';

  return (
    <TooltipProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background-2)] text-foreground">
        <header className="z-40 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Boxes className="size-4" />
          </span>
          <nav className="flex items-center gap-1">
            {nav.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => setView(n.key)}
                className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                  active === n.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{viewer.displayName}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">{viewer.role.name}</p>
            </div>
            <Badge variant="secondary">{viewer.role.name}</Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon-sm" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                  {isDark ? <Sun /> : <Moon />}
                  <span className="sr-only">Тема</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isDark ? 'Светлая тема' : 'Тёмная тема'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon-sm" onClick={signOut}>
                  <LogOut />
                  <span className="sr-only">Выйти</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Выйти</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          {active === 'builder' ? (
            <BuilderApp />
          ) : (
            <Scroll>
              {active === 'assess' ? <AssessmentsView viewer={viewer} /> : null}
              {active === 'admin' ? <AdminView viewer={viewer} has={has} /> : null}
            </Scroll>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}

function Scroll({ children }: { children: ReactNode }) {
  return <div className="h-full overflow-auto">{children}</div>;
}
