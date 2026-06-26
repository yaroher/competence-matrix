import { useState, type FormEvent } from 'react';
import { ChevronRight, Grid2x2Plus, LayoutGrid, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import type { CompetencyRoleVm } from '@/api';
import { createCompetencyRole } from '@/api';
import { CREATED_BY_USER_ID, requireText, type RunAction } from '@/lib/catalog';

type MatrixListProps = {
  roles: readonly CompetencyRoleVm[];
  gradeCount: number;
  isSaving: boolean;
  runAction: RunAction;
  onOpen: (roleId: string) => void;
};

export function MatrixList({ roles, gradeCount, isSaving, runAction, onOpen }: MatrixListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-card/60 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <LayoutGrid className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Матрицы</h2>
            <p className="text-sm text-muted-foreground">матриц: {roles.length} · колонок грейдов: {gradeCount}</p>
          </div>
        </div>
        <NewMatrixPopover isSaving={isSaving} runAction={runAction} onOpen={onOpen} />
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        {roles.length === 0 ? (
          <div className="grid h-full place-items-center">
            <div className="grid max-w-sm justify-items-center gap-3 text-center">
              <span className="grid size-14 place-items-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 text-primary">
                <Grid2x2Plus className="size-6" />
              </span>
              <h3 className="text-base font-semibold">Пока нет матриц</h3>
              <p className="text-sm text-muted-foreground">Матрица сопоставляет навыки роли с целевым уровнем по каждому грейду. Создайте первую.</p>
              <NewMatrixPopover isSaving={isSaving} runAction={runAction} onOpen={onOpen} />
            </div>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => {
              const required = role.skills.filter((roleSkill) => roleSkill.isRequired).length;
              const targets = role.skills.reduce((sum, roleSkill) => sum + roleSkill.gradeTargets.length, 0);
              return (
                <li key={role.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(role.id)}
                    className="group grid w-full gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-md)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{role.name}</p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{role.description || 'Без описания'}</p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">{role.skills.length} навыков</Badge>
                      <Badge variant="outline">обязательных: {required}</Badge>
                      <Badge variant="outline" className="font-mono">целей: {targets}</Badge>
                    </div>
                    {role.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {role.skills.slice(0, 5).map((roleSkill) => (
                          <span key={roleSkill.id} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                            {roleSkill.skill.name}
                          </span>
                        ))}
                        {role.skills.length > 5 ? (
                          <span className="rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground">+{role.skills.length - 5}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function NewMatrixPopover({ isSaving, runAction, onOpen }: { isSaving: boolean; runAction: RunAction; onOpen: (roleId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
    void runAction('Создать матрицу', async () => {
      const role = await createCompetencyRole({ name: requireText(name, 'Название матрицы'), description, createdByUserId: CREATED_BY_USER_ID });
      setName('');
      setDescription('');
      onOpen(role.id);
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm">
          <Plus /> Новая матрица
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <form className="grid gap-3" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="new-matrix-name">Название матрицы</Label>
            <Input id="new-matrix-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="например, Backend-инженер" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-matrix-desc">Описание</Label>
            <Textarea id="new-matrix-desc" value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="За что отвечает эта роль" />
          </div>
          <Button type="submit" size="sm" disabled={isSaving}>
            <Plus /> Создать и открыть
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
