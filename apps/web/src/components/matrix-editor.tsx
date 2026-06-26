import { Fragment, useEffect, useMemo, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft, Columns3, Download, GripVertical, MousePointerSquareDashed, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { CompetencyRoleSkillVm, CompetencyRoleVm, GradeVm, SkillVm } from '@/api';
import {
  addSkillToCompetencyRole,
  createGrade,
  removeSkillFromCompetencyRole,
  setRoleSkillGradeTarget,
  updateCompetencyRole,
  updateCompetencyRoleSkill,
  updateGrade,
} from '@/api';
import {
  CREATED_BY_USER_ID,
  parseRequiredInt,
  readDragPayload,
  requireText,
  type FolderRef,
  type RunAction,
} from '@/lib/catalog';
import { exportMatrixToXlsx } from '@/lib/export-xlsx';

type MatrixEditorProps = {
  role: CompetencyRoleVm;
  grades: readonly GradeVm[];
  skillsById: Map<string, SkillVm>;
  skillPaths: Map<string, FolderRef[]>;
  catalogOrder: Map<string, number>;
  isSaving: boolean;
  runAction: RunAction;
  onBack: () => void;
};

const UNGROUPED = '__ungrouped__';

type RowGroup = { key: string; path: FolderRef[]; rows: CompetencyRoleSkillVm[] };
type DragRow = { id: string; groupKey: string };

export function MatrixEditor({ role, grades, skillsById, skillPaths, catalogOrder, isSaving, runAction, onBack }: MatrixEditorProps) {
  const [over, setOver] = useState(false);
  const [drag, setDrag] = useState<DragRow | null>(null);
  const present = useMemo(() => new Set(role.skills.map((roleSkill) => roleSkill.skillId)), [role.skills]);
  const requiredCount = role.skills.filter((roleSkill) => roleSkill.isRequired).length;

  // Group rows by their leaf catalog folder; order groups by the catalog, rows by manual sortOrder.
  const groups = useMemo<RowGroup[]>(() => {
    const map = new Map<string, RowGroup>();
    for (const roleSkill of role.skills) {
      const path = skillPaths.get(roleSkill.skillId) ?? [];
      const key = path.length ? path[path.length - 1].id : UNGROUPED;
      const existing = map.get(key);
      if (existing) {
        existing.rows.push(roleSkill);
      } else {
        map.set(key, { key, path, rows: [roleSkill] });
      }
    }
    const arr = [...map.values()];
    const groupRank = (group: RowGroup) =>
      group.path.length ? catalogOrder.get(group.path[group.path.length - 1].id) ?? Number.MAX_SAFE_INTEGER : -1;
    arr.sort((a, b) => groupRank(a) - groupRank(b));
    arr.forEach((group) =>
      group.rows.sort((a, b) => a.sortOrder - b.sortOrder || a.skill.name.localeCompare(b.skill.name)),
    );
    return arr;
  }, [role.skills, skillPaths, catalogOrder]);

  function reorderWithinGroup(groupKey: string, fromId: string, toId: string) {
    if (fromId === toId) {
      return;
    }
    const group = groups.find((item) => item.key === groupKey);
    if (!group) {
      return;
    }
    const rows = group.rows;
    const fromIdx = rows.findIndex((r) => r.id === fromId);
    const toIdx = rows.findIndex((r) => r.id === toId);
    if (fromIdx < 0 || toIdx < 0) {
      return;
    }
    const reordered = [...rows];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const slots = rows.map((r) => r.sortOrder).sort((a, b) => a - b);
    const updates = reordered
      .map((r, i) => ({ row: r, sortOrder: slots[i] }))
      .filter(({ row, sortOrder }) => row.sortOrder !== sortOrder);
    if (updates.length === 0) {
      return;
    }
    void runAction('Переупорядочить навыки', async () => {
      for (const { row, sortOrder } of updates) {
        await updateCompetencyRoleSkill({ id: row.id, sortOrder, isRequired: row.isRequired });
      }
    });
  }

  function addSkills(skillIds: string[]) {
    const fresh = skillIds.filter((id) => !present.has(id));
    if (fresh.length === 0) {
      return;
    }
    void runAction(fresh.length > 1 ? `Добавить навыков: ${fresh.length}` : 'Добавить навык', async () => {
      for (const skillId of fresh) {
        await addSkillToCompetencyRole({ roleId: role.id, skillId, isRequired: true, createdByUserId: CREATED_BY_USER_ID });
      }
    });
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setOver(false);
    const payload = readDragPayload(event.dataTransfer);
    if (!payload) {
      return;
    }
    addSkills(payload.type === 'skill' ? [payload.skillId] : payload.skillIds);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-card/60 px-5 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <Button variant="outline" size="icon-sm" onClick={onBack} className="mt-0.5">
            <ArrowLeft />
            <span className="sr-only">Назад к матрицам</span>
          </Button>
          <div className="min-w-0">
            <InlineText
              value={role.name}
              className="text-lg font-semibold tracking-tight"
              placeholder="Без названия"
              onCommit={(name) => runAction('Переименовать матрицу', () => updateCompetencyRole({ id: role.id, name: requireText(name, 'Matrix name'), description: role.description }))}
            />
            <InlineText
              value={role.description}
              className="text-sm text-muted-foreground"
              placeholder="Добавьте описание…"
              onCommit={(description) => runAction('Обновить матрицу', () => updateCompetencyRole({ id: role.id, name: role.name, description }))}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">навыков: {role.skills.length}</Badge>
          <Badge variant="outline">обязательных: {requiredCount}</Badge>
          <AddGradePopover isSaving={isSaving} runAction={runAction} />
          <Button
            size="sm"
            variant="outline"
            disabled={role.skills.length === 0}
            onClick={() => void exportMatrixToXlsx(role.name, grades, groups)}
          >
            <Download /> Excel
          </Button>
        </div>
      </header>

      <div
        className="matrix-dropzone min-h-0 flex-1 overflow-auto"
        data-over={over}
        onDragOver={(event) => {
          if (readDragPayload(event.dataTransfer) || event.dataTransfer.types.includes('application/x-comatrix')) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            setOver(true);
          }
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) {
            setOver(false);
          }
        }}
        onDrop={handleDrop}
      >
        {role.skills.length === 0 ? (
          <EmptyMatrix grades={grades} />
        ) : (
          <table className="matrix-grid">
            <thead>
              <tr>
                <th className="matrix-corner">
                  <span className="font-mono text-[11px] tracking-wider">НАВЫК</span>
                </th>
                {grades.map((grade) => (
                  <th key={grade.id}>
                    <InlineText
                      value={grade.name}
                      className="font-mono text-[11px] font-semibold uppercase tracking-wider"
                      align="center"
                      placeholder="грейд"
                      onCommit={(name) => runAction('Переименовать грейд', () => updateGrade({ id: grade.id, name: requireText(name, 'Grade name'), sortOrder: grade.sortOrder }))}
                    />
                  </th>
                ))}
                <th>Обяз.</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, groupIndex) => (
                <Fragment key={group.key}>
                  <GroupHeader path={group.path} prevPath={groupIndex > 0 ? groups[groupIndex - 1].path : []} colSpan={grades.length + 2} />
                  {group.rows.map((roleSkill) => (
                    <MatrixRow
                      key={roleSkill.id}
                      roleSkill={roleSkill}
                      grades={grades}
                      skill={skillsById.get(roleSkill.skillId)}
                      isSaving={isSaving}
                      runAction={runAction}
                      isDragging={drag?.id === roleSkill.id}
                      canDrop={Boolean(drag && drag.groupKey === group.key && drag.id !== roleSkill.id)}
                      onDragStart={() => setDrag({ id: roleSkill.id, groupKey: group.key })}
                      onDragEnd={() => setDrag(null)}
                      onDropRow={() => {
                        if (drag && drag.groupKey === group.key) {
                          reorderWithinGroup(group.key, drag.id, roleSkill.id);
                        }
                        setDrag(null);
                      }}
                    />
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function GroupHeader({ path, prevPath, colSpan }: { path: FolderRef[]; prevPath: FolderRef[]; colSpan: number }) {
  if (path.length === 0) {
    return (
      <tr className="matrix-group">
        <td colSpan={colSpan} className="matrix-group-head">
          <span className="text-muted-foreground">Без категории</span>
        </td>
      </tr>
    );
  }
  let common = 0;
  while (common < path.length && common < prevPath.length && path[common].id === prevPath[common].id) {
    common += 1;
  }
  return (
    <tr className="matrix-group">
      <td colSpan={colSpan} className="matrix-group-head">
        <span className="matrix-crumbs">
          {path.map((folder, i) => (
            <span
              key={folder.id}
              className={`matrix-crumb${i < common ? ' is-muted' : ''}${i === 0 ? ' is-top' : ''}${i === path.length - 1 ? ' is-leaf' : ''}`}
            >
              {i > 0 ? <span className="matrix-crumb-sep">›</span> : null}
              {folder.name}
            </span>
          ))}
        </span>
      </td>
    </tr>
  );
}

function MatrixRow({
  roleSkill,
  grades,
  skill,
  isSaving,
  runAction,
  isDragging,
  canDrop,
  onDragStart,
  onDragEnd,
  onDropRow,
}: {
  roleSkill: CompetencyRoleSkillVm;
  grades: readonly GradeVm[];
  skill?: SkillVm;
  isSaving: boolean;
  runAction: RunAction;
  isDragging: boolean;
  canDrop: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropRow: () => void;
}) {
  const [dropHint, setDropHint] = useState(false);
  // Single source of truth for the scale: the live skill (carries marks + latest range),
  // falling back to the role-skill projection until the skills list resolves.
  const scale = skill ?? roleSkill.skill;
  return (
    <tr
      className="group matrix-row"
      data-dragging={isDragging}
      data-drop={dropHint && canDrop}
      onDragOver={(event) => {
        if (canDrop) {
          event.preventDefault();
          setDropHint(true);
        }
      }}
      onDragLeave={() => setDropHint(false)}
      onDrop={(event) => {
        if (canDrop) {
          event.preventDefault();
          setDropHint(false);
          onDropRow();
        }
      }}
    >
      <td className="matrix-skillcell">
        <div className="flex items-center gap-1.5">
          <span
            className="matrix-row-grip"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            title="Перетащите, чтобы изменить порядок внутри группы"
            aria-label="Переместить навык"
          >
            <GripVertical className="size-3.5" />
          </span>
          <ScaleHoverCard skill={skill}>
            <div className="min-w-0 flex-1 cursor-help">
              <p className="truncate text-sm font-medium">{roleSkill.skill.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {scale.scaleMin}–{scale.scaleMax} · шаг {scale.scaleStep}
              </p>
            </div>
          </ScaleHoverCard>
          <DeleteRowButton roleSkillId={roleSkill.id} skillName={roleSkill.skill.name} isSaving={isSaving} runAction={runAction} />
        </div>
      </td>
      {grades.map((grade) => {
        const target = roleSkill.gradeTargets.find((item) => item.gradeId === grade.id);
        return (
          <td key={grade.id} className="matrix-cell">
            <ScaleHoverCard skill={skill}>
              <div className="matrix-cell-trigger">
                <MatrixCell
                  key={`${grade.id}:${scale.scaleMin}:${scale.scaleMax}:${scale.scaleStep}`}
                  roleSkillId={roleSkill.id}
                  gradeId={grade.id}
                  scaleMin={scale.scaleMin}
                  scaleMax={scale.scaleMax}
                  scaleStep={scale.scaleStep}
                  value={target?.targetValue}
                  runAction={runAction}
                />
              </div>
            </ScaleHoverCard>
          </td>
        );
      })}
      <td>
        <div className="flex items-center justify-center">
          <Checkbox
            checked={roleSkill.isRequired}
            disabled={isSaving}
            onCheckedChange={(value) =>
              void runAction('Обновить навык', () =>
                updateCompetencyRoleSkill({ id: roleSkill.id, sortOrder: roleSkill.sortOrder, isRequired: value === true }),
              )
            }
          />
        </div>
      </td>
    </tr>
  );
}

function DeleteRowButton({
  roleSkillId,
  skillName,
  isSaving,
  runAction,
}: {
  roleSkillId: string;
  skillName: string;
  isSaving: boolean;
  runAction: RunAction;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 aria-expanded:opacity-100"
        >
          <Trash2 />
          <span className="sr-only">Убрать {skillName}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60">
        <p className="text-sm font-medium">Убрать навык из матрицы?</p>
        <p className="mt-1 text-xs text-muted-foreground">«{skillName}» и его целевые уровни в этой матрице будут удалены. Сам навык в каталоге останется.</p>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isSaving}
            onClick={() => {
              setOpen(false);
              void runAction('Убрать навык', () => removeSkillFromCompetencyRole({ id: roleSkillId }));
            }}
          >
            <Trash2 /> Убрать
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Hover a skill or a target cell to see what each scale level means. */
function ScaleHoverCard({ skill, children }: { skill?: SkillVm; children: ReactNode }) {
  if (!skill || skill.marks.length === 0) {
    return <>{children}</>;
  }
  const marks = [...skill.marks].sort((a, b) => a.value - b.value);
  return (
    <HoverCard openDelay={140} closeDelay={80}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="w-80">
        <p className="text-sm font-semibold">{skill.name}</p>
        <p className="mb-2 font-mono text-[11px] text-muted-foreground">
          шкала {skill.scaleMin}–{skill.scaleMax} · шаг {skill.scaleStep}
        </p>
        <ul className="grid gap-1.5">
          {marks.map((mark) => (
            <li key={mark.id} className="flex gap-2.5">
              <span className="w-5 shrink-0 text-right font-mono text-xs font-semibold text-primary">{mark.value}</span>
              <span className="min-w-0">
                <span className="text-xs font-medium">{mark.label}</span>
                {mark.description ? <span className="block text-[11px] leading-snug text-muted-foreground">{mark.description}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}

function MatrixCell({
  roleSkillId,
  gradeId,
  scaleMin,
  scaleMax,
  scaleStep,
  value,
  runAction,
}: {
  roleSkillId: string;
  gradeId: string;
  scaleMin: number;
  scaleMax: number;
  scaleStep: number;
  value?: number;
  runAction: RunAction;
}) {
  const [draft, setDraft] = useState(value !== undefined ? String(value) : '');

  useEffect(() => setDraft(value !== undefined ? String(value) : ''), [value]);

  const step = scaleStep > 0 ? scaleStep : 1;
  const isValidValue = (raw: string) => {
    const n = Number(raw);
    return Number.isInteger(n) && n >= scaleMin && n <= scaleMax && (n - scaleMin) % step === 0;
  };

  const trimmed = draft.trim();
  const invalid = trimmed !== '' && !isValidValue(trimmed);
  const range = Math.max(scaleMax - scaleMin, 1);
  const fill = trimmed !== '' && !invalid ? Math.min(Math.max((Number(trimmed) - scaleMin) / range, 0), 1) * 100 : 0;
  const hint = `Допустимо: ${scaleMin}–${scaleMax}${step !== 1 ? `, шаг ${step}` : ''}`;

  function commit() {
    const next = draft.trim();
    if (next === '' || Number(next) === value) {
      setDraft(value !== undefined ? String(value) : '');
      return;
    }
    if (!isValidValue(next)) {
      return; // keep the invalid value visible (flagged) and do not persist it
    }
    void runAction('Целевой уровень', () =>
      setRoleSkillGradeTarget({
        roleSkillId,
        gradeId,
        targetValue: parseRequiredInt(next, 'Target'),
        createdByUserId: CREATED_BY_USER_ID,
      }),
    );
  }

  return (
    <>
      {invalid ? null : <span className="matrix-cell-meter" style={{ width: `${fill}%` }} aria-hidden />}
      <input
        className="matrix-cell-input"
        value={draft}
        inputMode="numeric"
        placeholder="·"
        title={hint}
        aria-invalid={invalid}
        aria-label={`Целевой уровень, ${hint}`}
        onChange={(event) => {
          const allowed = scaleMin < 0 ? /[^0-9-]/g : /[^0-9]/g;
          setDraft(event.target.value.replace(allowed, ''));
        }}
        onBlur={commit}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          } else if (event.key === 'Escape') {
            setDraft(value !== undefined ? String(value) : '');
            event.currentTarget.blur();
          }
        }}
      />
    </>
  );
}

/** Inline-editable text: click to edit, Enter commits, Escape reverts. */
function InlineText({
  value,
  onCommit,
  className,
  placeholder,
  align = 'left',
}: {
  value: string;
  onCommit: (next: string) => Promise<void> | void;
  className?: string;
  placeholder?: string;
  align?: 'left' | 'center';
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  function commit() {
    setEditing(false);
    if (draft !== value) {
      void onCommit(draft.trim());
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
            commit();
          } else if (event.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`h-7 w-full rounded-md px-1.5 ${align === 'center' ? 'text-center' : ''} ${className ?? ''}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`block w-full truncate rounded-md px-1.5 py-0.5 text-left transition-colors hover:bg-muted/60 ${align === 'center' ? 'text-center' : ''} ${className ?? ''} ${value ? '' : 'text-muted-foreground'}`}
    >
      {value || placeholder}
    </button>
  );
}

function AddGradePopover({ isSaving, runAction }: { isSaving: boolean; runAction: RunAction }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
    void runAction('Добавить грейд', async () => {
      await createGrade({ name: requireText(name, 'Grade name'), createdByUserId: CREATED_BY_USER_ID });
      setName('');
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline">
          <Columns3 /> Грейд
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <form className="grid gap-3" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="add-grade-name">Новый столбец грейда</Label>
            <Input id="add-grade-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="напр. Senior" />
          </div>
          <p className="text-xs text-muted-foreground">Грейды общие для всех матриц.</p>
          <Button type="submit" size="sm" disabled={isSaving}>
            <Plus /> Добавить грейд
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function EmptyMatrix({ grades }: { grades: readonly GradeVm[] }) {
  return (
    <div className="grid h-full place-items-center p-8">
      <div className="grid max-w-sm justify-items-center gap-3 text-center">
        <span className="grid size-14 place-items-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 text-primary">
          <MousePointerSquareDashed className="size-6" />
        </span>
        <h3 className="text-base font-semibold">Перетащите навыки сюда, чтобы собрать матрицу</h3>
        <p className="text-sm text-muted-foreground">
          Перетащите навык или целую папку из каталога слева. Каждый навык становится строкой, столбцы грейдов — целевыми уровнями.
        </p>
        {grades.length === 0 ? <p className="text-xs text-muted-foreground">Совет: сначала добавьте столбец грейда кнопкой «Грейд» выше.</p> : null}
      </div>
    </div>
  );
}
