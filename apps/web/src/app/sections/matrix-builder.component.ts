import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import {
  CreateCompetencyCategoryDocument,
  CreateCompetencyDocument,
  CreateMatrixDocument,
  DeleteCompetencyCategoryDocument,
  DeleteCompetencyDocument,
  DeleteMatrixRequirementDocument,
  MatricesAdminDocument,
  SkillTreeDocument,
  UpdateCompetencyCategoryDocument,
  UpdateCompetencyDocument,
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
          <div class="tree-toolbar">
            <input class="fld tree-filter" [(ngModel)]="filter" placeholder="{{ 'builder.search' | tr }}" />
            <button class="icon-btn" type="button" (click)="toggleNewCat()" [class.active]="showNewCat()" title="{{ 'builder.addCategory' | tr }}">+</button>
          </div>
          @if (showNewCat()) {
            <div class="inline-form">
              <input class="fld grow" [(ngModel)]="newCatName" placeholder="{{ 'builder.categoryName' | tr }}" (keyup.enter)="addCategory()" />
              <button z-button zType="primary" zSize="sm" (click)="addCategory()" [disabled]="!newCatName().trim()">{{ 'common.add' | tr }}</button>
            </div>
          }
          <div class="tree-body">
            @for (cat of treeFiltered(); track cat.id) {
              <div class="node folder">
                <div class="row folder-row" [class.open]="!collapsed().has(cat.id)">
                  <button class="caret" type="button" (click)="toggleCollapse(cat.id)" [attr.aria-expanded]="!collapsed().has(cat.id)">▸</button>
                  <span class="glyph folder-glyph">▦</span>
                  @if (editingCatId() === cat.id) {
                    <input class="fld rename" [ngModel]="editCatName()" (ngModelChange)="editCatName.set($event)"
                      (keyup.enter)="saveRenameCat()" (keyup.escape)="cancelRename()" (blur)="saveRenameCat()" />
                  } @else {
                    <span class="label" (dblclick)="startRenameCat(cat)">{{ cat.name }}</span>
                  }
                  <span class="count">{{ cat.competencies.length }}</span>
                  <span class="row-actions">
                    <button class="act" type="button" (click)="startAddComp(cat.id)" title="{{ 'builder.addComp' | tr }}">+</button>
                    @if (editingCatId() !== cat.id) {
                      <button class="act" type="button" (click)="startRenameCat(cat)" title="{{ 'common.edit' | tr }} ✎">✎</button>
                    }
                    <button class="act danger" type="button" (click)="deleteCategory(cat.id, cat.name)" title="{{ 'common.delete' | tr }}">×</button>
                  </span>
                </div>
                @if (addingToCat() === cat.id) {
                  <div class="inline-form compact nest">
                    <input class="fld sm" [(ngModel)]="newCompCode" placeholder="{{ 'common.code' | tr }}" />
                    <input class="fld grow" [(ngModel)]="newCompName" placeholder="{{ 'comp.newCompName' | tr }}" (keyup.enter)="addComp(cat.id)" />
                    <button z-button zType="secondary" zSize="sm" (click)="addComp(cat.id)" [disabled]="!newCompCode().trim() || !newCompName().trim()">{{ 'common.add' | tr }}</button>
                  </div>
                }
                @if (!collapsed().has(cat.id)) {
                  <div class="children">
                    @for (comp of cat.competencies; track comp.id) {
                      <div
                        class="row leaf-row"
                        [class.added]="isAdded(comp.id)"
                        [class.disabled]="!selectedMatrixId()"
                        [attr.draggable]="selectedMatrixId() ? 'true' : 'false'"
                        (dragstart)="onDragStart($event, comp)"
                        (dragend)="onDragEnd()"
                      >
                        <span class="connector"></span>
                        <span class="glyph leaf-glyph">●</span>
                        @if (editingCompId() === comp.id) {
                          <input class="fld rename" [ngModel]="editCompName()" (ngModelChange)="editCompName.set($event)"
                            (keyup.enter)="saveRenameComp()" (keyup.escape)="cancelRename()" (blur)="saveRenameComp()" />
                        } @else {
                          <span class="code">{{ comp.code }}</span>
                          <span class="label" (dblclick)="startRenameComp(comp)">{{ comp.name }}</span>
                        }
                        @if (isAdded(comp.id)) { <span class="tick">✓</span> }
                        <span class="row-actions">
                          @if (editingCompId() !== comp.id) {
                            <button class="act" type="button" (click)="startRenameComp(comp)" title="✎">✎</button>
                          }
                          <button class="act danger" type="button" (click)="deleteComp(comp)" title="×">×</button>
                        </span>
                      </div>
                    } @empty {
                      <div class="row leaf-row muted"><span class="connector"></span><span class="empty-leaf">{{ 'comp.noComps' | tr }}</span></div>
                    }
                  </div>
                }
              </div>
            } @empty {
              <p class="muted tree-empty">{{ 'builder.treeEmpty' | tr }}</p>
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
      .tree-toolbar { display: flex; gap: 8px; align-items: center; padding: 12px; border-bottom: 1px solid #eef1f5; }
      .tree-filter { flex: 1; }
      .icon-btn { flex: none; width: 34px; height: 34px; border-radius: 8px; border: 1px solid #d2d7df; background: #fff; color: #0e6e62; font-size: 19px; line-height: 1; cursor: pointer; transition: background 140ms, color 140ms; }
      .icon-btn:hover, .icon-btn.active { background: #0e6e62; color: #fff; }

      .inline-form { display: flex; gap: 6px; align-items: center; padding: 10px 12px; border-bottom: 1px solid #eef1f5; background: #f9fafb; }
      .inline-form.compact { margin: 4px 0 2px 26px; padding: 8px; border-radius: 9px; border: 1px solid #e4e7ec; background: #fff; }
      .inline-form.nest { margin-left: 26px; }
      .inline-form .fld.grow { flex: 1; min-width: 0; }
      .inline-form .fld.sm { width: 80px; }

      .tree-body { overflow: auto; padding: 6px 4px 12px; font-size: 13px; }
      .tree-empty { padding: 16px; text-align: center; }

      .node { user-select: none; }
      .row { display: flex; align-items: center; gap: 6px; padding: 3px 6px; border-radius: 7px; transition: background 120ms; position: relative; }
      .row:hover { background: #f4f6f8; }
      .folder-row { font-weight: 600; letter-spacing: -0.01em; cursor: default; }
      .leaf-row { padding-left: 4px; cursor: grab; }
      .leaf-row:active { cursor: grabbing; }
      .leaf-row.disabled { opacity: .45; cursor: not-allowed; }
      .leaf-row.added { color: #0b564d; }

      .caret { flex: none; width: 18px; height: 18px; display: grid; place-items: center; border: none; background: transparent; color: #9aa3af; cursor: pointer; font-size: 11px; transition: transform 160ms ease; transform: rotate(0deg); }
      .open .caret { transform: rotate(90deg); }
      .glyph { flex: none; width: 16px; text-align: center; font-size: 12px; }
      .folder-glyph { color: #0e6e62; }
      .leaf-glyph { color: #b9c0c9; font-size: 8px; }
      .connector { flex: none; width: 18px; height: 16px; border-left: 1px dotted #c9cfd7; border-bottom: 1px dotted #c9cfd7; margin-left: 15px; border-radius: 0 0 0 8px; }

      .label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .code { font-family: 'Geist Mono', monospace; font-size: 10.5px; color: #626b7a; background: #eef1f5; border-radius: 5px; padding: 1px 6px; flex: none; }
      .count { flex: none; font-size: 10.5px; color: #9aa3af; background: #eef1f5; border-radius: 999px; padding: 0 7px; line-height: 16px; }
      .tick { flex: none; color: #0e6e62; font-weight: 700; font-size: 12px; }
      .empty-leaf { color: #aab1ba; font-style: italic; }

      .row-actions { flex: none; display: flex; align-items: center; gap: 1px; opacity: 0; transition: opacity 120ms; }
      .row:hover .row-actions { opacity: 1; }
      .act { border: none; background: transparent; color: #9aa3af; font-size: 13px; line-height: 1; cursor: pointer; width: 22px; height: 22px; border-radius: 6px; transition: background 120ms, color 120ms; }
      .act:hover { background: #e6e9ee; color: #0e6e62; }
      .act.danger:hover { background: #fbeae9; color: #a82a1f; }

      .rename { flex: 1; min-width: 0; padding: 2px 7px; font-size: 13px; }
      .children { }

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

  // tree editing
  readonly showNewCat = signal(false);
  readonly newCatName = signal('');
  readonly addingToCat = signal<string | null>(null);
  readonly newCompCode = signal('');
  readonly newCompName = signal('');
  // inline rename
  readonly editingCatId = signal<string | null>(null);
  readonly editCatName = signal('');
  readonly editingCompId = signal<string | null>(null);
  readonly editCompName = signal('');
  readonly collapsed = signal<Set<string>>(new Set());

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

  // ── skill tree CRUD ──
  toggleNewCat() {
    this.showNewCat.set(!this.showNewCat());
    this.newCatName.set('');
  }
  addCategory() {
    const name = this.newCatName().trim();
    if (!name) return;
    this.api.mutate(CreateCompetencyCategoryDocument, {
      input: { organizationId: 'org-demo', categoryType: 'domain', name, description: '' },
    }).subscribe({
      next: () => { this.newCatName.set(''); this.showNewCat.set(false); },
      error: (e) => this.toast.error(e.message),
    });
  }
  deleteCategory(id: string, name: string) {
    if (!confirm(`${this.i18n.t('builder.delCatConfirm')} "${name}"?`)) return;
    this.api.mutate(DeleteCompetencyCategoryDocument, { id }).subscribe({ error: (e) => this.toast.error(e.message) });
  }

  startAddComp(catId: string) {
    this.addingToCat.set(this.addingToCat() === catId ? null : catId);
    this.newCompCode.set('');
    this.newCompName.set('');
  }
  addComp(catId: string) {
    const code = this.newCompCode().trim();
    const name = this.newCompName().trim();
    if (!code || !name) return;
    this.api.mutate(CreateCompetencyDocument, {
      input: { organizationId: 'org-demo', categoryId: catId, code, name, description: '', tags: [] },
    }).subscribe({
      next: () => { this.newCompCode.set(''); this.newCompName.set(''); },
      error: (e) => this.toast.error(e.message),
    });
  }
  deleteComp(comp: TreeCompetency) {
    if (!confirm(`${this.i18n.t('builder.delCompConfirm')} "${comp.name}"?`)) return;
    this.api.mutate(DeleteCompetencyDocument, { id: comp.id }).subscribe({ error: (e) => this.toast.error(e.message) });
  }

  // ── inline rename ──
  startRenameCat(cat: Category) {
    this.editingCatId.set(cat.id);
    this.editCatName.set(cat.name);
    this.editingCompId.set(null);
  }
  saveRenameCat() {
    const id = this.editingCatId();
    const name = this.editCatName().trim();
    if (id && name) {
      this.api.mutate(UpdateCompetencyCategoryDocument, { input: { id, name } }).subscribe({ error: (e) => this.toast.error(e.message) });
    }
    this.editingCatId.set(null);
  }
  startRenameComp(comp: TreeCompetency) {
    this.editingCompId.set(comp.id);
    this.editCompName.set(comp.name);
    this.editingCatId.set(null);
  }
  saveRenameComp() {
    const id = this.editingCompId();
    const name = this.editCompName().trim();
    if (id && name) {
      this.api.mutate(UpdateCompetencyDocument, { input: { id, name } }).subscribe({ error: (e) => this.toast.error(e.message) });
    }
    this.editingCompId.set(null);
  }
  cancelRename() {
    this.editingCatId.set(null);
    this.editingCompId.set(null);
  }
  toggleCollapse(id: string) {
    this.collapsed.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
