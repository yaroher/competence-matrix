import { describe, expect, it } from 'vitest';
import { mvpSeed } from './seed.js';
import { applyCompetencyImport, parseCompetencyImport, toGapExportRows, toMatrixRequirementExportRows } from './exchange.js';

describe('parseCompetencyImport', () => {
  it('accepts a valid seed-like payload and parses categories + competencies', () => {
    const report = parseCompetencyImport([
      { category: 'Cloud', code: 'CLO-1', name: 'AWS basics' },
      { category: 'Cloud', categoryType: 'platform', code: 'CLO-2', name: 'Kubernetes', description: 'k8s', tags: ['platform'] },
    ]);

    expect(report.valid).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.parsed.categories).toHaveLength(1);
    expect(report.parsed.competencies).toHaveLength(2);
  });

  it('reports actionable row-level errors for invalid rows', () => {
    const report = parseCompetencyImport([
      { category: '', code: '', name: '' },
      { category: 'Cloud', code: 'DUP', name: 'first' },
      { category: 'Cloud', code: 'DUP', name: 'duplicate' },
    ]);

    expect(report.valid).toBe(false);
    expect(report.rowCount).toBe(3);
    const row1 = report.errors.filter((err) => err.row === 1);
    expect(row1.some((err) => err.field === 'category')).toBe(true);
    expect(row1.some((err) => err.field === 'code')).toBe(true);
    expect(row1.some((err) => err.field === 'name')).toBe(true);
    const dup = report.errors.find((err) => err.row === 3 && err.field === 'code');
    expect(dup?.message).toContain('Duplicate');
  });
});

describe('applyCompetencyImport', () => {
  it('adds categories and competencies into the seed and skips existing codes', () => {
    const seed = structuredClone(mvpSeed);
    const report = parseCompetencyImport([{ category: 'Cloud', code: 'CLO-NEW', name: 'New cloud competency' }]);
    expect(report.valid).toBe(true);

    const result = applyCompetencyImport(seed, report);
    expect(result.categoriesAdded).toBe(1);
    expect(result.competenciesAdded).toBe(1);
    expect(seed.competencies.some((c) => c.code === 'CLO-NEW')).toBe(true);

    const second = applyCompetencyImport(seed, report);
    expect(second.categoriesAdded).toBe(0);
    expect(second.competenciesAdded).toBe(0);
  });

  it('throws when applying an invalid report', () => {
    const seed = structuredClone(mvpSeed);
    const report = parseCompetencyImport([{ category: '', code: '', name: '' }]);
    expect(() => applyCompetencyImport(seed, report)).toThrow();
  });
});

describe('toMatrixRequirementExportRows', () => {
  it('produces deterministic export rows for the seeded revision', () => {
    const revision = mvpSeed.matrixRevisions[0];
    const rows = toMatrixRequirementExportRows(mvpSeed, revision.id);

    expect(rows).toHaveLength(revision.requirements.length);
    expect(rows[0].competencyCode).toBeTruthy();
    expect(rows[0].competencyName).toBeTruthy();
    expect(typeof rows[0].normalizedWeight).toBe('number');
  });

  it('returns empty for an unknown revision', () => {
    expect(toMatrixRequirementExportRows(mvpSeed, 'nope')).toEqual([]);
  });
});

describe('toGapExportRows', () => {
  it('produces deterministic gap export rows for the seeded assessment', () => {
    const assessment = mvpSeed.assessments[0];
    const rows = toGapExportRows(mvpSeed, assessment.id);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.gap >= 0)).toBe(true);
    expect(rows.some((row) => row.competencyCode)).toBe(true);
  });

  it('returns empty for an unknown assessment', () => {
    expect(toGapExportRows(mvpSeed, 'nope')).toEqual([]);
  });
});
