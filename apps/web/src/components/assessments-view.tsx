import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, RefreshCw, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type AssignmentVm,
  type EmployeeVm,
  type ViewerVm,
  loadAssignmentsForEmployee,
  loadEmployees,
  loadMyAssignments,
} from '@/api';
import type { RunAction } from '@/lib/catalog';
import { AssessGrid } from '@/components/assess-grid';

export function AssessmentsView({ viewer }: { viewer: ViewerVm }) {
  const [mine, setMine] = useState<readonly AssignmentVm[]>([]);
  const [employees, setEmployees] = useState<readonly EmployeeVm[]>([]);
  const [teamFor, setTeamFor] = useState<string | null>(null);
  const [teamAssignments, setTeamAssignments] = useState<readonly AssignmentVm[]>([]);

  const reloadMine = useCallback(async () => {
    setMine(await loadMyAssignments());
  }, []);

  useEffect(() => {
    void reloadMine();
    void loadEmployees().then(setEmployees).catch(() => setEmployees([]));
  }, [reloadMine]);

  // Subordinates = descendants of the viewer's own employee node.
  const subordinates = useMemo(() => {
    const rootId = viewer.employee?.id;
    if (!rootId) return [];
    const childrenByParent = new Map<string, EmployeeVm[]>();
    for (const e of employees) {
      if (e.managerId) {
        const list = childrenByParent.get(e.managerId) ?? [];
        list.push(e);
        childrenByParent.set(e.managerId, list);
      }
    }
    const out: EmployeeVm[] = [];
    const stack = [...(childrenByParent.get(rootId) ?? [])];
    const seen = new Set<string>();
    while (stack.length) {
      const e = stack.pop()!;
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      out.push(e);
      (childrenByParent.get(e.id) ?? []).forEach((c) => stack.push(c));
    }
    return out.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [employees, viewer.employee?.id]);

  const openTeam = useCallback(async (employeeId: string) => {
    setTeamFor(employeeId);
    setTeamAssignments(await loadAssignmentsForEmployee(employeeId));
  }, []);

  const runMine: RunAction = useCallback(
    async (_label, task) => {
      await task();
      await reloadMine();
    },
    [reloadMine],
  );
  const runTeam: RunAction = useCallback(
    async (_label, task) => {
      await task();
      if (teamFor) setTeamAssignments(await loadAssignmentsForEmployee(teamFor));
    },
    [teamFor],
  );

  return (
    <div className="mx-auto grid max-w-[1100px] gap-6 p-6">
      <section className="grid gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="size-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight">Моя оценка</h2>
        </div>
        {!viewer.employee ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Ваша учётная запись не привязана к сотруднику.
          </p>
        ) : mine.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Вам пока не назначены матрицы.</p>
        ) : (
          mine.map((a) => (
            <Card key={a.id} className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{a.role.name}</CardTitle>
                <CardDescription>Целевой грейд: {a.grade.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <AssessGrid assignment={a} viewerId={viewer.id} isSaving={false} runAction={runMine} />
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {subordinates.length > 0 ? (
        <section className="grid gap-3">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-secondary" />
            <h2 className="text-lg font-semibold tracking-tight">Команда</h2>
            <Badge variant="outline">{subordinates.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {subordinates.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => void openTeam(e.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors hover:border-primary/40 ${
                  teamFor === e.id ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                }`}
              >
                {e.fullName}
                {e.title ? <span className="ml-1 text-xs text-muted-foreground">· {e.title}</span> : null}
              </button>
            ))}
          </div>
          {teamFor ? (
            teamAssignments.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">У сотрудника нет назначенных матриц.</p>
            ) : (
              teamAssignments.map((a) => (
                <Card key={a.id} className="rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {a.employee.fullName}
                      <RefreshCw className="hidden" />
                      <span className="text-sm font-normal text-muted-foreground">· {a.role.name}</span>
                    </CardTitle>
                    <CardDescription>Целевой грейд: {a.grade.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AssessGrid assignment={a} viewerId={viewer.id} isSaving={false} runAction={runTeam} />
                  </CardContent>
                </Card>
              ))
            )
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
