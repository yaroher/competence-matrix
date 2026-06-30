import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { type AssignmentVm, setAssessment } from '@/api';
import { isScaleValue, type RunAction } from '@/lib/catalog';

type SkillRow = AssignmentVm['role']['skills'][number];

export function AssessGrid({
  assignment,
  viewerId,
  isSaving,
  runAction,
}: {
  assignment: AssignmentVm;
  viewerId: string;
  isSaving: boolean;
  runAction: RunAction;
}) {
  const skills = useMemo(
    () => [...assignment.role.skills].sort((a, b) => a.sortOrder - b.sortOrder || a.skill.name.localeCompare(b.skill.name)),
    [assignment.role.skills],
  );
  // Group assessments by skill.
  const bySkill = useMemo(() => {
    const map = new Map<string, { self?: AssignmentVm['assessments'][number]; managers: AssignmentVm['assessments'][number][] }>();
    for (const a of assignment.assessments) {
      const entry = map.get(a.skillId) ?? { managers: [] };
      if (a.kind === 'SELF') entry.self = a;
      else entry.managers.push(a);
      map.set(a.skillId, entry);
    }
    return map;
  }, [assignment.assessments]);

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="py-2 pr-3">Навык</th>
            <th className="px-3 text-center">Цель ({assignment.grade.name})</th>
            <th className="px-3 text-center">Самооценка</th>
            <th className="px-3 text-center">Руководитель</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((row) => {
            const target = row.gradeTargets.find((t) => t.gradeId === assignment.gradeId)?.targetValue ?? null;
            const entry = bySkill.get(row.skillId) ?? { managers: [] };
            const ownManager = entry.managers.find((m) => m.assessorUserId === viewerId);
            const otherManagers = entry.managers.filter((m) => m.assessorUserId !== viewerId);
            return (
              <tr key={row.id} className="border-b border-border/60">
                <td className="py-2 pr-3">
                  <p className="font-medium">{row.skill.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {row.skill.scaleMin}–{row.skill.scaleMax}
                    {row.isRequired ? ' · обяз.' : ''}
                  </p>
                </td>
                <td className="px-3 text-center font-mono">{target ?? '—'}</td>
                <td className="px-3 text-center">
                  {assignment.canAssessSelf ? (
                    <AssessCell
                      value={entry.self?.value}
                      target={target}
                      skill={row.skill}
                      isSaving={isSaving}
                      onCommit={(value) =>
                        runAction('Самооценка', () => setAssessment({ assignmentId: assignment.id, skillId: row.skillId, value }))
                      }
                    />
                  ) : (
                    <Gap value={entry.self?.value ?? null} target={target} />
                  )}
                </td>
                <td className="px-3 text-center">
                  {assignment.canAssessManager ? (
                    <AssessCell
                      value={ownManager?.value}
                      target={target}
                      skill={row.skill}
                      isSaving={isSaving}
                      onCommit={(value) =>
                        runAction('Оценка руководителя', () => setAssessment({ assignmentId: assignment.id, skillId: row.skillId, value }))
                      }
                    />
                  ) : (
                    <Gap value={entry.managers[0]?.value ?? null} target={target} />
                  )}
                  {otherManagers.length > 0 ? (
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {otherManagers.map((m) => (
                        <span key={m.id} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground" title={m.assessorName}>
                          {m.assessorName.split(' ')[0]}: <span className="font-mono">{m.value}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
          {skills.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                В матрице нет навыков
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function gapClass(value: number | null, target: number | null) {
  if (value == null) return 'text-muted-foreground';
  if (target == null) return 'text-foreground';
  return value >= target ? 'text-primary' : 'text-[var(--warning,#b4620a)]';
}

function Gap({ value, target }: { value: number | null; target: number | null }) {
  return <span className={`font-mono font-semibold ${gapClass(value, target)}`}>{value ?? '—'}</span>;
}

function AssessCell({
  value,
  target,
  skill,
  isSaving,
  onCommit,
}: {
  value?: number;
  target: number | null;
  skill: SkillRow['skill'];
  isSaving: boolean;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(value !== undefined ? String(value) : '');
  useEffect(() => setDraft(value !== undefined ? String(value) : ''), [value]);

  const numeric = Number(draft);
  const invalid = draft.trim() !== '' && !isScaleValue(numeric, skill.scaleMin, skill.scaleMax, skill.scaleStep);

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed || Number(trimmed) === value || invalid) {
      if (invalid) return;
      setDraft(value !== undefined ? String(value) : '');
      return;
    }
    onCommit(numeric);
  }

  return (
    <input
      value={draft}
      inputMode="numeric"
      disabled={isSaving}
      placeholder="·"
      aria-invalid={invalid}
      title={`Допустимо: ${skill.scaleMin}–${skill.scaleMax}`}
      onChange={(e) => setDraft(e.target.value.replace(skill.scaleMin < 0 ? /[^0-9-]/g : /[^0-9]/g, ''))}
      onBlur={commit}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className={`h-8 w-16 rounded-md border text-center font-mono font-semibold ${
        invalid ? 'border-destructive text-destructive' : draft && target != null && numeric >= target ? 'border-primary/40 text-primary' : ''
      }`}
    />
  );
}
