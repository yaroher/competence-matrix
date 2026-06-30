import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Network, Trash2, UserPlus, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type AssignmentVm,
  type EmployeeVm,
  type Permission,
  type ViewerVm,
  assignMatrix,
  createAppRole,
  createEmployee,
  createUser,
  deleteAppRole,
  deleteEmployee,
  deleteUser,
  loadAppRoles,
  loadAssignmentsForEmployee,
  loadCatalogSnapshot,
  loadEmployees,
  loadUsers,
  removeAssignment,
  updateAppRole,
  updateEmployee,
  updateUser,
} from '@/api';

const NONE = '__none__';
const PERMISSION_LABELS: Record<Permission, string> = {
  MANAGE_CATALOG: 'Каталог навыков',
  MANAGE_MATRICES: 'Матрицы и грейды',
  MANAGE_ORG: 'Оргструктура',
  ASSIGN_MATRICES: 'Назначение матриц',
  MANAGE_USERS_ROLES: 'Пользователи и роли',
  VIEW_ALL_ASSESSMENTS: 'Просмотр всех оценок',
};

export function AdminView({ has }: { viewer: ViewerVm; has: (p: Permission) => boolean }) {
  const tabs = [
    has('MANAGE_ORG') && { value: 'org', label: 'Оргструктура' },
    has('ASSIGN_MATRICES') && { value: 'assign', label: 'Назначения' },
    has('MANAGE_USERS_ROLES') && { value: 'access', label: 'Доступ' },
  ].filter(Boolean) as { value: string; label: string }[];

  if (tabs.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">Нет прав администрирования.</p>;
  }

  return (
    <div className="mx-auto max-w-[1100px] p-6">
      <Tabs defaultValue={tabs[0].value}>
        <TabsList className="mb-4 grid h-auto w-full gap-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0,1fr))` }}>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {has('MANAGE_ORG') ? (
          <TabsContent value="org">
            <OrgAdmin />
          </TabsContent>
        ) : null}
        {has('ASSIGN_MATRICES') ? (
          <TabsContent value="assign">
            <AssignAdmin />
          </TabsContent>
        ) : null}
        {has('MANAGE_USERS_ROLES') ? (
          <TabsContent value="access">
            <AccessAdmin />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}

function useReload<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      setData(await loader());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  const run = useCallback(
    async (task: () => Promise<unknown>) => {
      try {
        await task();
        await reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка');
      }
    },
    [reload],
  );
  return { data, error, reload, run, setError };
}

// --- Оргструктура ---
function OrgAdmin() {
  const { data: employees, error, run } = useReload<readonly EmployeeVm[]>(loadEmployees, []);
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [managerId, setManagerId] = useState(NONE);

  const sorted = useMemo(() => [...employees].sort((a, b) => a.fullName.localeCompare(b.fullName)), [employees]);

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(async () => {
      await createEmployee({ fullName, title, managerId: managerId === NONE ? null : managerId });
      setFullName('');
      setTitle('');
      setManagerId(NONE);
    });
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Network className="size-4 text-secondary" /> Оргструктура
        </CardTitle>
        <CardDescription>{employees.length} сотрудников · строгое дерево руководителей</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <form className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={add}>
          <div className="grid gap-1.5">
            <Label htmlFor="emp-name" className="text-xs">ФИО</Label>
            <Input id="emp-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Иван Иванов" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="emp-title" className="text-xs">Должность</Label>
            <Input id="emp-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Руководитель</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>— (корень)</SelectItem>
                {sorted.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit"><UserPlus /> Добавить</Button>
        </form>
        <div className="grid gap-1.5">
          {sorted.map((e) => (
            <div key={e.id} className="grid items-center gap-2 rounded-lg border bg-[var(--panel-strong)] p-2 sm:grid-cols-[1fr_1fr_auto]">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{e.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{e.title || '—'}</p>
              </div>
              <Select value={e.managerId ?? NONE} onValueChange={(v) => void run(() => updateEmployee({ id: e.id, managerId: v === NONE ? null : v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>— (корень)</SelectItem>
                  {sorted.filter((o) => o.id !== e.id).map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => void run(() => deleteEmployee(e.id))}>
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Назначения ---
function AssignAdmin() {
  const { data: employees } = useReload<readonly EmployeeVm[]>(loadEmployees, []);
  const [matrices, setMatrices] = useState<{ id: string; name: string }[]>([]);
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([]);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [roleId, setRoleId] = useState<string>('');
  const [gradeId, setGradeId] = useState<string>('');
  const [assignments, setAssignments] = useState<readonly AssignmentVm[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadCatalogSnapshot().then((s) => {
      setMatrices(s.competencyRoles.map((r) => ({ id: r.id, name: r.name })));
      setGrades([...s.grades].sort((a, b) => a.sortOrder - b.sortOrder).map((g) => ({ id: g.id, name: g.name })));
    });
  }, []);

  const reloadAssignments = useCallback(async (empId: string) => {
    if (!empId) return setAssignments([]);
    try {
      setAssignments(await loadAssignmentsForEmployee(empId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  }, []);

  useEffect(() => {
    void reloadAssignments(employeeId);
  }, [employeeId, reloadAssignments]);

  async function run(task: () => Promise<unknown>) {
    try {
      await task();
      await reloadAssignments(employeeId);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Назначение матриц</CardTitle>
        <CardDescription>Сотрудник + матрица + целевой грейд</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Field label="Сотрудник">
            <Select value={employeeId || NONE} onValueChange={(v) => setEmployeeId(v === NONE ? '' : v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.fullName}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Матрица">
            <Select value={roleId || NONE} onValueChange={(v) => setRoleId(v === NONE ? '' : v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {matrices.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Грейд">
            <Select value={gradeId || NONE} onValueChange={(v) => setGradeId(v === NONE ? '' : v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {grades.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Button
            disabled={!employeeId || !roleId || !gradeId}
            onClick={() => void run(() => assignMatrix({ employeeId, roleId, gradeId }))}
          >
            Назначить
          </Button>
        </div>
        {employeeId ? (
          assignments.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Нет назначений.</p>
          ) : (
            <div className="grid gap-1.5">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border bg-[var(--panel-strong)] p-2.5">
                  <span className="text-sm">{a.role.name} <span className="text-muted-foreground">· {a.grade.name}</span></span>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => void run(() => removeAssignment(a.id))}>
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}

// --- Доступ (роли + пользователи) ---
function AccessAdmin() {
  const roles = useReload<Awaited<ReturnType<typeof loadAppRoles>>>(loadAppRoles, { appRoles: [], permissions: [] });
  const users = useReload<Awaited<ReturnType<typeof loadUsers>>>(loadUsers, []);
  const { data: employees } = useReload<readonly EmployeeVm[]>(loadEmployees, []);

  const [roleName, setRoleName] = useState('');
  const [u, setU] = useState({ email: '', password: '', displayName: '', roleId: '', employeeId: NONE });

  const allPerms = roles.data.permissions;

  return (
    <div className="grid gap-4">
      {(roles.error || users.error) ? <p className="text-sm text-destructive">{roles.error ?? users.error}</p> : null}

      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><UsersRound className="size-4 text-primary" /> Роли</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {roles.data.appRoles.map((role) => (
            <div key={role.id} className="rounded-lg border bg-[var(--panel-strong)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{role.name} {role.isSystem ? <Badge variant="outline" className="ml-1">системная</Badge> : null}</span>
                {!role.isSystem ? (
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => void roles.run(() => deleteAppRole(role.id))}>
                    <Trash2 />
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {allPerms.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={role.permissions.includes(p)}
                      disabled={role.isSystem}
                      onCheckedChange={(checked) => {
                        const next = checked === true ? [...role.permissions, p] : role.permissions.filter((x) => x !== p);
                        void roles.run(() => updateAppRole({ id: role.id, permissions: next }));
                      }}
                    />
                    {PERMISSION_LABELS[p]}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void roles.run(async () => {
                await createAppRole({ name: roleName, permissions: [] });
                setRoleName('');
              });
            }}
          >
            <Field label="Новая роль">
              <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="напр. Руководитель" />
            </Field>
            <Button type="submit">Создать</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Пользователи</CardTitle>
          <CardDescription>{users.data.length} учётных записей</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {users.data.map((user) => (
            <div key={user.id} className="grid items-center gap-2 rounded-lg border bg-[var(--panel-strong)] p-2.5 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Select value={user.roleId} onValueChange={(v) => void users.run(() => updateUser({ id: user.id, roleId: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.data.appRoles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={user.employeeId ?? NONE} onValueChange={(v) => void users.run(() => updateUser({ id: user.id, employeeId: v === NONE ? null : v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>— без сотрудника</SelectItem>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={() => void users.run(() => deleteUser(user.id))}>
                <Trash2 />
              </Button>
            </div>
          ))}
          <form
            className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              void users.run(async () => {
                await createUser({
                  email: u.email,
                  password: u.password,
                  displayName: u.displayName,
                  roleId: u.roleId,
                  employeeId: u.employeeId === NONE ? null : u.employeeId,
                });
                setU({ email: '', password: '', displayName: '', roleId: '', employeeId: NONE });
              });
            }}
          >
            <Field label="Имя"><Input value={u.displayName} onChange={(e) => setU({ ...u, displayName: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} /></Field>
            <Field label="Пароль"><Input type="password" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} /></Field>
            <Field label="Роль">
              <Select value={u.roleId || NONE} onValueChange={(v) => setU({ ...u, roleId: v === NONE ? '' : v })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {roles.data.appRoles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Button type="submit" disabled={!u.email || !u.password || !u.displayName || !u.roleId}>Создать</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
