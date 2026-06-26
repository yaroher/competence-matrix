import { useCallback, useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Monitor,
  Moon,
  RefreshCw,
  Sun,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CatalogTree } from '@/components/catalog-tree';
import { MatrixEditor } from '@/components/matrix-editor';
import { MatrixList } from '@/components/matrix-list';
import { useTheme, type ThemePreference } from '@/lib/theme';
import {
  buildCatalogTree,
  buildSkillFolderPaths,
  catalogOrderIndex,
  skillIdsInRole,
  CREATED_BY_USER_ID,
  type RunAction,
} from '@/lib/catalog';
import type { CatalogSnapshotVm, SkillVm } from './api';
import { addSkillToCompetencyRole, loadCatalogSnapshot } from './api';

type ActionState = {
  status: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
};

export function App() {
  const { preference, setTheme } = useTheme();
  const [snapshot, setSnapshot] = useState<CatalogSnapshotVm | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [action, setAction] = useState<ActionState>({ status: 'idle' });
  const [openMatrixId, setOpenMatrixId] = useState<string | null>(null);
  const [pendingMatrixId, setPendingMatrixId] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const stored = Number(localStorage.getItem('comatrix-left-width'));
    return Number.isFinite(stored) && stored >= 240 ? Math.min(stored, 640) : 320;
  });

  useEffect(() => {
    localStorage.setItem('comatrix-left-width', String(leftWidth));
  }, [leftWidth]);

  const startLeftResize = useCallback(
    (event: ReactPointerEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startW = leftWidth;
      const move = (ev: PointerEvent) => {
        setLeftWidth(Math.min(640, Math.max(240, startW + (ev.clientX - startX))));
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [leftWidth],
  );

  const reload = useCallback(async () => {
    setLoadState('loading');
    setErrorMessage(null);
    try {
      const next = await loadCatalogSnapshot();
      setSnapshot(next);
      setLoadState('ready');
    } catch (error) {
      setLoadState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить каталог');
    }
  }, []);

  const runAction = useCallback<RunAction>(
    async (label, task) => {
      setAction({ status: 'saving', message: label });
      try {
        await task();
        await reload();
        setAction({ status: 'success', message: `${label} сохранено` });
      } catch (error) {
        setAction({ status: 'error', message: error instanceof Error ? error.message : `${label}: ошибка` });
      }
    },
    [reload],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  // Auto-dismiss success/error toast.
  useEffect(() => {
    if (action.status === 'success' || action.status === 'error') {
      const timer = setTimeout(() => setAction({ status: 'idle' }), 3200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [action]);

  const roots = useMemo(() => buildCatalogTree(snapshot?.skillCatalogNodes ?? []), [snapshot]);
  const skillsById = useMemo(() => {
    const map = new Map<string, SkillVm>();
    (snapshot?.skills ?? []).forEach((skill) => map.set(skill.id, skill));
    return map;
  }, [snapshot]);
  const grades = useMemo(
    () => [...(snapshot?.grades ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [snapshot],
  );
  const skillPaths = useMemo(() => buildSkillFolderPaths(snapshot?.skillCatalogNodes ?? []), [snapshot]);
  const catalogOrder = useMemo(() => catalogOrderIndex(snapshot?.skillCatalogNodes ?? []), [snapshot]);
  const roles = snapshot?.competencyRoles ?? [];
  const openMatrix = openMatrixId ? roles.find((role) => role.id === openMatrixId) ?? null : null;
  const matrixSkillIds = useMemo(() => skillIdsInRole(openMatrix), [openMatrix]);
  const isSaving = action.status === 'saving';

  // Resolve a freshly created matrix once it lands in the next snapshot.
  useEffect(() => {
    if (pendingMatrixId && roles.some((role) => role.id === pendingMatrixId)) {
      setOpenMatrixId(pendingMatrixId);
      setPendingMatrixId(null);
    }
  }, [pendingMatrixId, roles]);

  const openMatrixById = useCallback(
    (roleId: string) => {
      if (roles.some((role) => role.id === roleId)) {
        setOpenMatrixId(roleId);
      } else {
        setPendingMatrixId(roleId);
      }
    },
    [roles],
  );

  const quickAddToMatrix = useCallback(
    (skillId: string) => {
      if (!openMatrix || matrixSkillIds.has(skillId)) {
        return;
      }
      void runAction('Добавить навык', () =>
        addSkillToCompetencyRole({ roleId: openMatrix.id, skillId, isRequired: true, createdByUserId: CREATED_BY_USER_ID }),
      );
    },
    [matrixSkillIds, openMatrix, runAction],
  );

  return (
    <TooltipProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background-2)] text-foreground">
        <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-primary)]">
              <Boxes className="size-[18px]" />
            </span>
            <nav className="flex min-w-0 items-center gap-1.5 text-sm">
              <button
                type="button"
                onClick={() => setOpenMatrixId(null)}
                className={`rounded-md px-1.5 py-0.5 font-semibold transition-colors hover:text-foreground ${openMatrix ? 'text-muted-foreground' : 'text-foreground'}`}
              >
                Матрицы
              </button>
              {openMatrix ? (
                <>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-semibold">{openMatrix.name}</span>
                </>
              ) : null}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {roles.length > 0 ? (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="font-normal">
                        Перейти к…
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Переключить матрицу</TooltipContent>
                </Tooltip>
                <DropdownMenuContent className="max-h-80 overflow-auto">
                  <DropdownMenuLabel>Открыть матрицу</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roles.map((role) => (
                    <DropdownMenuItem
                      key={role.id}
                      onSelect={() => setOpenMatrixId(role.id)}
                      className={role.id === openMatrixId ? 'text-primary' : undefined}
                    >
                      {role.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <StatusBadge loadState={loadState} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon-sm" onClick={() => void reload()} disabled={loadState === 'loading'}>
                  <RefreshCw className={loadState === 'loading' ? 'animate-spin' : undefined} />
                  <span className="sr-only">Обновить</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Обновить</TooltipContent>
            </Tooltip>
            <ThemeToggle preference={preference} setTheme={setTheme} />
          </div>
        </header>

        <div
          className="grid min-h-0 flex-1"
          style={{ gridTemplateColumns: `${leftWidth}px 6px minmax(0,1fr)` }}
        >
          <aside className="min-h-0 border-r border-border bg-card">
            <CatalogTree
              roots={roots}
              skillsById={skillsById}
              matrixSkillIds={matrixSkillIds}
              hasOpenMatrix={Boolean(openMatrix)}
              isSaving={isSaving}
              runAction={runAction}
              onQuickAdd={quickAddToMatrix}
            />
          </aside>

          <div
            role="separator"
            aria-orientation="vertical"
            onPointerDown={startLeftResize}
            className="group relative cursor-col-resize bg-border transition-colors hover:bg-primary/60"
            title="Потяните, чтобы изменить ширину"
          >
            <span className="absolute inset-y-0 -left-1 -right-1" />
          </div>

          <section className="min-h-0 bg-[var(--background-2)]">
            {loadState === 'error' ? (
              <div className="grid h-full place-items-center p-8">
                <div className="flex max-w-md items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-medium">Не удалось загрузить каталог.</p>
                    <p className="mt-1 text-destructive/80">{errorMessage}</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => void reload()}>
                      <RefreshCw /> Повторить
                    </Button>
                  </div>
                </div>
              </div>
            ) : openMatrix ? (
              <MatrixEditor
                role={openMatrix}
                grades={grades}
                skillsById={skillsById}
                skillPaths={skillPaths}
                catalogOrder={catalogOrder}
                isSaving={isSaving}
                runAction={runAction}
                onBack={() => setOpenMatrixId(null)}
              />
            ) : (
              <MatrixList roles={roles} gradeCount={grades.length} isSaving={isSaving} runAction={runAction} onOpen={openMatrixById} />
            )}
          </section>
        </div>

        <StatusToast action={action} />
      </div>
    </TooltipProvider>
  );
}

function StatusBadge({ loadState }: { loadState: 'loading' | 'ready' | 'error' }) {
  return (
    <Badge
      variant={loadState === 'ready' ? 'secondary' : loadState === 'error' ? 'destructive' : 'outline'}
      className="gap-1.5"
    >
      <span className={`size-1.5 rounded-full bg-current ${loadState === 'loading' ? 'animate-pulse' : ''}`} />
      {loadState === 'ready' ? 'Подключено' : loadState === 'error' ? 'Нет связи' : 'Загрузка'}
    </Badge>
  );
}

function ThemeToggle({ preference, setTheme }: { preference: ThemePreference; setTheme: (next: ThemePreference) => void }) {
  const options: { value: ThemePreference; label: string; icon: ReactNode }[] = [
    { value: 'light', label: 'Светлая', icon: <Sun /> },
    { value: 'dark', label: 'Тёмная', icon: <Moon /> },
    { value: 'system', label: 'Системная', icon: <Monitor /> },
  ];
  const active = options.find((option) => option.value === preference) ?? options[1];

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon-sm">
              {active.icon}
              <span className="sr-only">Оформление: {active.label}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Оформление — {active.label}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent>
        <DropdownMenuLabel>Оформление</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => setTheme(option.value)}
            className={option.value === preference ? 'text-primary' : undefined}
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusToast({ action }: { action: ActionState }) {
  if (action.status === 'idle') {
    return null;
  }
  const tone =
    action.status === 'error'
      ? 'border-destructive/30 bg-destructive/10 text-destructive'
      : action.status === 'success'
        ? 'border-primary/30 bg-primary/10 text-primary'
        : 'border-border bg-card text-muted-foreground';
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50">
      <div className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm shadow-[var(--shadow-lg)] ${tone}`}>
        {action.status === 'error' ? (
          <AlertCircle className="size-4 shrink-0" />
        ) : action.status === 'saving' ? (
          <RefreshCw className="size-4 shrink-0 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4 shrink-0" />
        )}
        <span>{action.message}</span>
      </div>
    </div>
  );
}
