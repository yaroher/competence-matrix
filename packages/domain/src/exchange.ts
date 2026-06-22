import { calculateGaps } from './assessment.js';
import type { Competency, CompetencyCategory, MatrixRevision, MvpSeed } from './types.js';

export interface CompetencyImportRow {
  category: string;
  categoryType?: string;
  code: string;
  name: string;
  description?: string;
  tags?: string[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
}

export interface ParsedCompetencyImport {
  categories: Pick<CompetencyCategory, 'name' | 'categoryType'>[];
  competencies: {
    categoryName: string;
    code: string;
    name: string;
    description: string;
    tags: string[];
  }[];
}

export interface ImportValidationReport {
  applied: boolean;
  rowCount: number;
  valid: boolean;
  errors: ImportError[];
  parsed: ParsedCompetencyImport;
}

export interface MatrixRequirementExportRow {
  competencyCode: string;
  competencyName: string;
  targetLevel: number;
  required: boolean;
  normalizedWeight: number;
  criticality: string;
  neededOnEntry: boolean;
}

export interface GapExportRow {
  competencyCode: string;
  competencyName: string;
  targetLevel: number;
  currentLevel: number;
  gap: number;
  weightedGap: number;
  criticality: string;
}

const ALLOWED_FIELDS: ReadonlyArray<keyof CompetencyImportRow> = ['category', 'categoryType', 'code', 'name', 'description', 'tags'];

/**
 * Validate and parse a competency import payload. Returns a deterministic
 * validation report: `valid` is false if any row fails, `errors` lists every
 * row-level violation with its 1-based row number, and `parsed` holds the
 * successfully parsed categories/competencies. Nothing is applied here — the
 * caller decides whether to apply based on `valid`.
 */
export function parseCompetencyImport(rows: CompetencyImportRow[]): ImportValidationReport {
  const errors: ImportError[] = [];
  const categories = new Map<string, Pick<CompetencyCategory, 'name' | 'categoryType'>>();
  const competencies: ParsedCompetencyImport['competencies'] = [];
  const seenCodes = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    if (!row || typeof row !== 'object') {
      errors.push({ row: rowNumber, message: 'Row is not an object.' });
      return;
    }
    if (!row.category || !row.category.trim()) {
      errors.push({ row: rowNumber, field: 'category', message: 'Category is required.' });
    } else {
      categories.set(row.category, {
        name: row.category,
        categoryType: row.categoryType?.trim() || 'domain',
      });
    }
    if (!row.code || !row.code.trim()) {
      errors.push({ row: rowNumber, field: 'code', message: 'Competency code is required.' });
    } else if (seenCodes.has(row.code)) {
      errors.push({ row: rowNumber, field: 'code', message: `Duplicate competency code "${row.code}".` });
    } else {
      seenCodes.add(row.code);
    }
    if (!row.name || !row.name.trim()) {
      errors.push({ row: rowNumber, field: 'name', message: 'Competency name is required.' });
    }
    if (errors.every((err) => err.row !== rowNumber)) {
      competencies.push({
        categoryName: row.category,
        code: row.code,
        name: row.name,
        description: row.description?.trim() ?? '',
        tags: Array.isArray(row.tags) ? row.tags : [],
      });
    }
  });

  void ALLOWED_FIELDS;
  return {
    applied: false,
    rowCount: rows.length,
    valid: errors.length === 0,
    errors,
    parsed: { categories: Array.from(categories.values()), competencies },
  };
}

/**
 * Apply a previously-validated parsed import into the in-memory seed. Only call
 * when `report.valid` is true. Returns the number of categories and competencies
 * added. Does not duplicate existing codes/categories.
 */
export function applyCompetencyImport(seed: MvpSeed, report: ImportValidationReport): { categoriesAdded: number; competenciesAdded: number } {
  if (!report.valid) {
    throw new Error('Cannot apply an invalid competency import.');
  }
  const organizationId = seed.organization.id;
  let categoriesAdded = 0;
  let competenciesAdded = 0;

  for (const category of report.parsed.categories) {
    const exists = seed.categories.some((item) => item.name.toLowerCase() === category.name.toLowerCase());
    if (!exists) {
      seed.categories.push({
        id: `cat-imported-${category.name.toLowerCase().replace(/\s+/g, '-')}`,
        organizationId,
        categoryType: category.categoryType,
        name: category.name,
        description: '',
        sourceKind: 'imported',
        sortOrder: (seed.categories.at(-1)?.sortOrder ?? 0) + 10,
        status: 'active',
      });
      categoriesAdded += 1;
    }
  }

  for (const competency of report.parsed.competencies) {
    const exists = seed.competencies.some((item) => item.code === competency.code);
    if (exists) {
      continue;
    }
    const category = seed.categories.find((item) => item.name === competency.categoryName);
    if (!category) {
      continue;
    }
    seed.competencies.push({
      id: `comp-imported-${competency.code.toLowerCase()}`,
      organizationId,
      categoryId: category.id,
      code: competency.code,
      name: competency.name,
      description: competency.description,
      sourceKind: 'imported',
      validationStatus: 'draft',
      tags: competency.tags,
      behavioralIndicators: [],
    } satisfies Competency);
    competenciesAdded += 1;
  }

  return { categoriesAdded, competenciesAdded };
}

/** Serialize a matrix revision's requirements into export-friendly rows. */
export function toMatrixRequirementExportRows(seed: MvpSeed, revisionId: string): MatrixRequirementExportRow[] {
  const revision = seed.matrixRevisions.find((item) => item.id === revisionId);
  if (!revision) {
    return [];
  }
  return revision.requirements.map((requirement) => {
    const competency = seed.competencies.find((item) => item.id === requirement.competencyId);
    return {
      competencyCode: competency?.code ?? requirement.competencyId,
      competencyName: competency?.name ?? requirement.competencyId,
      targetLevel: requirement.targetLevel,
      required: requirement.required,
      normalizedWeight: requirement.normalizedWeight,
      criticality: requirement.criticality,
      neededOnEntry: requirement.neededOnEntry,
    };
  });
}

/** Serialize an assessment's gap summary into export-friendly rows. */
export function toGapExportRows(seed: MvpSeed, assessmentId: string): GapExportRow[] {
  const assessment = seed.assessments.find((item) => item.id === assessmentId);
  if (!assessment) {
    return [];
  }
  const revision = seed.matrixRevisions.find((item): item is MatrixRevision => item.id === assessment.matrixRevisionId);
  if (!revision) {
    return [];
  }
  return calculateGaps(revision, assessment).map((gap) => {
    const competency = seed.competencies.find((item) => item.id === gap.competencyId);
    return {
      competencyCode: competency?.code ?? gap.competencyId,
      competencyName: competency?.name ?? gap.competencyId,
      targetLevel: gap.targetLevel,
      currentLevel: gap.currentLevel,
      gap: gap.gap,
      weightedGap: gap.weightedGap,
      criticality: gap.criticality,
    };
  });
}
