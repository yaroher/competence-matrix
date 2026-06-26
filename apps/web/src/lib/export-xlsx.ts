import type { CompetencyRoleSkillVm, GradeVm } from '@/api';
import type { FolderRef } from '@/lib/catalog';

export type ExportGroup = { path: FolderRef[]; rows: CompetencyRoleSkillVm[] };

/**
 * Export a matrix to .xlsx mirroring the swimlane view: a "Категория" column
 * (top-level folder, merged) + "Подкатегория" (rest of the path, merged) +
 * skill rows with one column per grade holding the target value.
 * xlsx is imported lazily so it stays out of the main bundle.
 */
export async function exportMatrixToXlsx(roleName: string, grades: readonly GradeVm[], groups: readonly ExportGroup[]) {
  const XLSX = await import('xlsx');
  const header = ['Категория', 'Подкатегория', 'Навык', 'Обяз.', ...grades.map((grade) => grade.name)];
  const aoa: (string | number)[][] = [header];
  const meta: { category: string; sub: string }[] = [];

  for (const group of groups) {
    const category = group.path[0]?.name ?? 'Без категории';
    const sub = group.path.slice(1).map((folder) => folder.name).join(' › ');
    for (const roleSkill of group.rows) {
      const row: (string | number)[] = [category, sub, roleSkill.skill.name, roleSkill.isRequired ? 'Да' : ''];
      for (const grade of grades) {
        const target = roleSkill.gradeTargets.find((item) => item.gradeId === grade.id);
        row.push(target ? target.targetValue : '');
      }
      aoa.push(row);
      meta.push({ category, sub });
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Merge vertical runs of equal Категория (col 0) and Категория+Подкатегория (col 1).
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];
  const mergeRuns = (col: number, equal: (a: number, b: number) => boolean) => {
    let i = 0;
    while (i < meta.length) {
      let j = i;
      while (j + 1 < meta.length && equal(i, j + 1)) {
        j += 1;
      }
      if (j > i) {
        merges.push({ s: { r: i + 1, c: col }, e: { r: j + 1, c: col } });
      }
      i = j + 1;
    }
  };
  mergeRuns(0, (a, b) => meta[a].category === meta[b].category);
  mergeRuns(1, (a, b) => meta[a].category === meta[b].category && meta[a].sub === meta[b].sub);
  ws['!merges'] = merges;

  ws['!cols'] = [
    { wch: 26 },
    { wch: 30 },
    { wch: 42 },
    { wch: 7 },
    ...grades.map(() => ({ wch: Math.max(8, 0) + 10 })),
  ];

  const wb = XLSX.utils.book_new();
  const safeName = roleName.replace(/[\\/:*?"<>|]/g, ' ').trim() || 'matrix';
  XLSX.utils.book_append_sheet(wb, ws, 'Матрица');
  XLSX.writeFile(wb, `Матрица — ${safeName}.xlsx`);
}
