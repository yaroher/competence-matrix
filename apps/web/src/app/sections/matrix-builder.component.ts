import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import {
  CreateMatrixDocument,
  DeleteMatrixRequirementDocument,
  MatricesAdminDocument,
  SkillTreeDocument,
  UpsertMatrixRequirementDocument,
  type MatricesAdminQuery,
  type SkillTreeQuery,
} from '@comatrix/api-contracts';
import { ApiService } from '../api.service';
import { I18nService } from '../i18n/i18n.service';
import { TrPipe } from '../i18n/tr.pipe';
import { ToastService } from '../toast.service';
import { ZardBadgeComponent } from '../shared/components/badge';
import { ZardButtonComponent } from '../shared/components/button';

type Category = SkillTreeQuery['ontology']['categories'][number];
type TreeCompetency = Category['competencies'][number];
type Matrix = MatricesAdminQuery['matrices'][number];
type Requirement = NonNullable<Matrix['activeRevision']>['requirements'][number];

@Component({
  selector: 'app-matrix-builder',
  standalone: true,
  imports: [FormsModule, ZardButtonComponent, TrPipe],
  template: `
    <section class="builder">
      <header class="builder-head">
        <div>
          <span class="eyebrow">{{ 'builder.subtitle' | tr }}</span>
          <h2>{{ 'builder.title' | tr }}</h2>
        </div>
        <div class="head-tools">
          <select class="fld" [value]="selectedMatrixId()" (change)="selectMatrix($any($event.target).value)">
            <option value="">{{ 'builder.chooseMatrix' | tr }}</option>
            @for (m of matrices(); track m.id) { <option [value]="m.id">{{ m.name }}</option> }
          </select>
          <button z-button zType="secondary" zSize="sm" (click)="toggleNew()">{{ 'builder.newMatrix' | tr }}</button>
        </div>
      </header>

      @if (showNew()) {
        <article class="new-matrix">
          <input class="fld grow" [(ngModel)]="newName" placeholder="{{ 'builder.matrixName' | tr }}" />
          <select class="fld" [(ngModel)]="newProfile">
            @for (p of matricesData()?.roleProfiles; track p.id) { <option [value]="p.id">{{ p.name }}</option> }
          </select>
          <button z-button zType="primary" zSize="sm" (click)="createMatrix()" [disabled]="!newName().trim()">{{ 'common.create' | tr }}</button>
          <button z-button zType="ghost" zSize="sm" (click)="toggleNew()">{{ 'common.cancel' | tr }}</button>
        </article>
      }

      <div class="split">
        <!-- ── skill tree ── -->
        <aside class="tree">
          <div class="tree-search">
            <input class="fld" [(ngModel)]="filter" placeholder="{{ 'builder.search' | tr }}" />
          </div>
          <div class="tree-scroll">
            @for (cat of treeFiltered(); track cat.id) {
              <details class="cat" open>
                <summary>
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-count">{{ cat.competencies.length }}</span>
                </summary>
                <div class="cat-comps">
                  @for (comp of cat.competencies; track comp.id) {
                    <div
                      class="chip"
                      [class.chip-added]="isAdded(comp.id)"
                      [attr.draggable]="selectedMatrixId() ? 'true' : 'false'"
                      [class.chip-disabled]="!selectedMatrixId()"
                      (dragstart)="onDragStart($event, comp)"
                      (dragend)="onDragEnd()"
                    >
                      <span class="chip-grip">⠿</span>
                      <span class="chip-code">{{ comp.code }}</span>
                      <span class="chip-name">{{ comp.name }}</span>
                      @if (isAdded(comp.id)) { <span class="chip-tick">✓</span> }
                    </div>
                  }
                </div>
              </details>
            } @empty {
              <p class="muted">{{ 'builder.treeEmpty' | tr }}</p>
            }
          </div>
        </aside>

        <!-- ── matrix drop zone ── -->
        <div
          class="matrix"
          [class.matrix-over]="dragOver()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave()"
          (drop)="onDrop($event)"
        >
          @if (!selectedMatrixId()) {
            <div class="matrix-placeholder">
              <strong>{{ 'builder.selectToStart' | tr }}</strong>
              <span>{{ 'builder.selectToStartHint' | tr }}</span>
            </div>
          } @else if (requirements().length === 0) {
            <div class="matrix-placeholder">
              <strong>{{ 'builder.empty' | tr }}</strong>
              <span>{{ 'builder.emptyHint' | tr }}</span>
            </div>
          } @else {
            <div class="req-list">
              @for (r of requirements(); track r.id) {
                <article class="req">
                  <div class="req-main">
                    <span class="req-code">{{ r.competency?.code }}</span>
                    <span class="req-name">{{ r.competency?.name }}</span>
                  </div>
                  <div class="req-level">
                    @for (lvl of [1,2,3,4,5]; track lvl) {
                      <button
                        type="button"
                        class="dot"
                        [class.dot-on]="lvl <= r.targetLevel"
                        [class.dot-target]="lvl === r.targetLevel"
                        (click)="setLevel(r, lvl)"
                        [attr.aria-label]="'L' + lvl"
                      ></button>
                    }
                    <span class="level-num">L{{ r.targetLevel }}</span>
                  </div>
                  <div class="req-meta">
                    <label class="meta">
                      <span>{{ 'builder.weight' | tr }}</span>
                      <input class="fld sm" type="number" step="0.01" min="0" max="1"
                        [value]="r.normalizedWeight"
                        (change)="setWeight(r, $any($event.target).value)" />
                    </label>
                    <select class="fld crit" [value]="r.criticality" (change)="setCrit(r, $any($event.target).value)">
                      <option value="high">{{ 'builder.critHigh' | tr }}</option>
                      <option value="medium">{{ 'builder.critMedium' | tr }}</option>
                      <option value="low">{{ 'builder.critLow' | tr }}</option>
                    </select>
                    <button class="req-remove" type="button" (click)="remove(r)" aria-label="remove">×</button>
                  </div>
                </article>
              }
            </div>
            <div class="matrix-foot">
              <span class="muted">{{ requirements().length }} {{ 'builder.inMatrix' | tr }}</span>
              <span class="muted">Σ weight {{ totalWeight() }}</span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .builder { display: grid; gap: 16px; }
      .builder-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
      .builder-head h2 { margin: 2px 0 0; letter-spacing: -0.025em; font-size: 22px; font-weight: 700; }
      .head-tools { display: flex; gap: 8px; align-items: center; }
      .eyebrow { color: #626b7a; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
      .fld { padding: 7px 10px; border: 1px solid #d2d7df; border-radius: 8px; font-size: 13px; background: #fff; }
      .fld.grow { min-width: 180px; }
      .fld.sm { width: 64px; padding: 5px 8px; }

      .new-matrix { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 14px; border-radius: 12px; background: #fff; border: 1px solid #e4e7ec; box-shadow: 0 1px 2px rgba(20,24,31,.04); }
      .new-matrix .fld.grow { flex: 1; min-width: 200px; }

      .split { display: grid; grid-template-columns: minmax(280px, 360px) minmax(0, 1fr); gap: 16px; align-items: stretch; }
      @media (max-width: 920px) { .split { grid-template-columns: 1fr; } }

      .tree { display: flex; flex-direction: column; background: #fff; border: 1px solid #e4e7ec; border-radius: 14px; box-shadow: 0 1px 2px rgba(20,24,31,.04); overflow: hidden; max-height: 70vh; }
      .tree-search { padding: 12px; border-bottom: 1px solid #eef1f5; }
      .tree-search .fld { width: 100%; }
      .tree-scroll { overflow: auto; padding: 8px; }

      details.cat { border-bottom: 1px solid #f1f3f6; }
      details.cat:last-child { border-bottom: 0; }
      .cat summary { display: flex; justify-content: space-between; align-items: center; padding: 9px 10px; cursor: pointer; border-radius: 8px; list-style: none; font-weight: 600; font-size: 13px; }
      .cat summary::-webkit-details-marker { display: none; }
      .cat summary:hover { background: #f6f7f9; }
      .cat-name { letter-spacing: -0.01em; }
      .cat-count { font-size: 11px; color: #9aa3af; background: #eef1f5; border-radius: 999px; padding: 1px 8px; }
      .cat-comps { display: grid; gap: 5px; padding: 2px 6px 10px; }

      .chip { display: flex; align-items: center; gap: 7px; padding: 7px 9px; border: 1px solid #e4e7ec; border-radius: 9px; background: #fff; font-size: 12.5px; cursor: grab; transition: border-color 140ms, box-shadow 140ms, transform 100ms; user-select: none; }
      .chip:hover { border-color: #0e6e62; box-shadow: 0 0 0 3px rgba(14,110,98,.1); }
      .chip:active { cursor: grabbing; transform: scale(.99); }
      .chip-disabled { opacity: .45; cursor: not-allowed; }
      .chip-disabled:hover { border-color: #e4e7ec; box-shadow: none; }
      .chip-added { background: #f0f7f5; border-color: #cfe7e1; }
      .chip-grip { color: #b9c0c9; font-size: 14px; line-height: 1; }
      .chip-code { font-family: 'Geist Mono', monospace; font-size: 10.5px; color: #626b7a; background: #eef1f5; border-radius: 5px; padding: 1px 5px; }
      .chip-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .chip-tick { color: #0e6e62; font-weight: 700; }

      .matrix { min-height: 320px; border-radius: 14px; background: #fff; border: 2px dashed #d7dde3; padding: 16px; display: flex; flex-direction: column; transition: border-color 160ms, background 160ms; box-shadow: 0 1px 2px rgba(20,24,31,.04); }
      .matrix-over { border-color: #0e6e62; background: #f3faf8; }
      .matrix-placeholder { margin: auto; text-align: center; color: #626b7a; display: grid; gap: 4px; }
      .matrix-placeholder strong { color: #14181f; font-size: 15px; }

      .req-list { display: grid; gap: 9px; }
      .req { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 14px; align-items: center; padding: 12px 14px; border: 1px solid #e4e7ec; border-radius: 11px; background: #fff; transition: border-color 140ms, box-shadow 140ms; }
      .req:hover { border-color: #d2d7df; box-shadow: 0 4px 12px -4px rgba(20,24,31,.08); }
      .req-main { min-width: 0; }
      .req-code { font-family: 'Geist Mono', monospace; font-size: 10.5px; color: #626b7a; }
      .req-name { display: block; font-weight: 600; font-size: 13.5px; letter-spacing: -0.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      .req-level { display: flex; align-items: center; gap: 5px; }
      .dot { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #d2d7df; background: #fff; padding: 0; cursor: pointer; transition: background 140ms, border-color 140ms, transform 100ms; }
      .dot:hover { border-color: #0e6e62; transform: scale(1.12); }
      .dot-on { background: #0e6e62; border-color: #0e6e62; }
      .dot-target { box-shadow: 0 0 0 3px rgba(14,110,98,.18); }
      .level-num { margin-left: 6px; font-size: 11px; font-weight: 700; color: #626b7a; font-variant-numeric: tabular-nums; }

      .req-meta { display: flex; align-items: center; gap: 8px; }
      .meta { display: flex; flex-direction: column; gap: 2px; font-size: 10px; color: #9aa3af; }
      .meta .fld { width: 60px; }
      .fld.crit { width: 96px; }
      .req-remove { border: none; background: transparent; color: #9aa3af; font-size: 18px; line-height: 1; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
      .req-remove:hover { color: #a82a1f; background: #fbeae9; }

      .matrix-foot { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 8px; border-top: 1px solid #eef1f5; }
      .muted { color: #626b7a; font-size: 12.5px; }
    `,
  ],
})
export class MatrixBuilderComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  readonly i18n = inject(I18nService);

  readonly treeData = toSignal(this.api.changes$.pipe(switchMap(() => this.api.query(SkillTreeDocument))), { initialValue: null });
  readonly matricesData = toSignal(this.api.changes$.pipe(switchMap(() => this.api.query(MatricesAdminDocument))), { initialValue: null });

  readonly categories = computed<readonly Category[]>(() => this.treeData()?.ontology.categories ?? []);
  readonly matrices = computed<readonly Matrix[]>(() => this.matricesData()?.matrices ?? []);

  readonly selectedMatrixId = signal('');
  readonly filter = signal('');
  readonly showNew = signal(false);
  readonly newName = signal('');
  readonly newProfile = signal('');
  readonly draggedId = signal<string | null>(null);
  readonly dragOver = signal(false);

  readonly selectedMatrix = computed<Matrix | null>(() => this.matrices().find((m) => m.id === this.selectedMatrixId()) ?? null);
  readonly requirements = computed<readonly Requirement[]>(() => this.selectedMatrix()?.activeRevision?.requirements ?? []);
  readonly addedIds = computed(() => new Set(this.requirements().map((r) => r.competency?.id).filter(Boolean) as string[]));
  readonly totalWeight = computed(() => this.requirements().reduce((s, r) => s + (r.normalizedWeight ?? 0), 0).toFixed(2));

  readonly treeFiltered = computed<Category[]>(() => {
    const q = this.filter().trim().toLowerCase();
    const cats = this.categories();
    if (!q) return [...cats];
    return cats
      .map((c) => ({ ...c, competencies: c.competencies.filter((comp) => comp.name.toLowerCase().includes(q) || comp.code.toLowerCase().includes(q)) }))
      .filter((c) => c.competencies.length > 0);
  });

  selectMatrix(id: string) {
    this.selectedMatrixId.set(id);
  }
  toggleNew() {
    this.showNew.set(!this.showNew());
    if (this.showNew() && !this.newProfile()) {
      this.newProfile.set(this.matricesData()?.roleProfiles[0]?.id ?? '');
    }
  }
  createMatrix() {
    const name = this.newName().trim();
    if (!name) return;
    this.api.mutate(CreateMatrixDocument, { input: { roleProfileId: this.newProfile(), name } }).subscribe({
      next: (d) => {
        const created = (d as { createMatrix: { id: string } }).createMatrix;
        this.newName.set('');
        this.showNew.set(false);
        if (created?.id) this.selectedMatrixId.set(created.id);
      },
      error: (e) => this.toast.error(e.message),
    });
  }

  isAdded(compId: string) {
    return this.addedIds().has(compId);
  }

  onDragStart(e: DragEvent, comp: TreeCompetency) {
    if (!this.selectedMatrixId()) { e.preventDefault(); return; }
    this.draggedId.set(comp.id);
    e.dataTransfer?.setData('text/plain', comp.id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
  }
  onDragEnd() {
    this.draggedId.set(null);
    this.dragOver.set(false);
  }
  onDragOver(e: DragEvent) {
    if (!this.selectedMatrixId() || !this.draggedId()) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    this.dragOver.set(true);
  }
  onDragLeave() {
    this.dragOver.set(false);
  }
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    const compId = this.draggedId() ?? e.dataTransfer?.getData('text/plain');
    this.draggedId.set(null);
    if (!compId || !this.selectedMatrix()) return;
    this.add(compId);
  }

  private add(compId: string) {
    const rev = this.selectedMatrix()?.activeRevision;
    if (!rev) return;
    if (this.isAdded(compId)) return;
    this.api.mutate(UpsertMatrixRequirementDocument, {
      input: { revisionId: rev.id, competencyId: compId, targetLevel: 3, normalizedWeight: 0.05, criticality: 'medium', neededOnEntry: false },
    }).subscribe({ error: (e) => this.toast.error(e.message) });
  }

  setLevel(r: Requirement, level: number) {
    const rev = this.selectedMatrix()?.activeRevision;
    if (!rev) return;
    this.api.mutate(UpsertMatrixRequirementDocument, {
      input: { revisionId: rev.id, competencyId: r.competency.id, targetLevel: level, normalizedWeight: r.normalizedWeight, criticality: r.criticality, neededOnEntry: r.neededOnEntry },
    }).subscribe({ error: (e) => this.toast.error(e.message) });
  }
  setWeight(r: Requirement, value: string) {
    const rev = this.selectedMatrix()?.activeRevision;
    if (!rev) return;
    this.api.mutate(UpsertMatrixRequirementDocument, {
      input: { revisionId: rev.id, competencyId: r.competency.id, targetLevel: r.targetLevel, normalizedWeight: Number(value), criticality: r.criticality, neededOnEntry: r.neededOnEntry },
    }).subscribe({ error: (e) => this.toast.error(e.message) });
  }
  setCrit(r: Requirement, value: string) {
    const rev = this.selectedMatrix()?.activeRevision;
    if (!rev) return;
    this.api.mutate(UpsertMatrixRequirementDocument, {
      input: { revisionId: rev.id, competencyId: r.competency.id, targetLevel: r.targetLevel, normalizedWeight: r.normalizedWeight, criticality: value, neededOnEntry: r.neededOnEntry },
    }).subscribe({ error: (e) => this.toast.error(e.message) });
  }
  remove(r: Requirement) {
    this.api.mutate(DeleteMatrixRequirementDocument, { id: r.id }).subscribe({ error: (e) => this.toast.error(e.message) });
  }
}
