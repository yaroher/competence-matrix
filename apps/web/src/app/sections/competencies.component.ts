import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CreateCompetencyCategoryDocument,
  CreateCompetencyDocument,
  DeleteCompetencyCategoryDocument,
  DeleteCompetencyDocument,
  OntologyAdminDocument,
  UpdateCompetencyDocument,
  type OntologyAdminQuery,
} from '@comatrix/api-contracts';
import { ApiService } from '../api.service';
import { ZardBadgeComponent } from '../shared/components/badge';
import { ZardButtonComponent } from '../shared/components/button';

type Category = OntologyAdminQuery['ontology']['categories'][number];
type Competency = Category['competencies'][number];

@Component({
  selector: 'app-competencies',
  standalone: true,
  imports: [FormsModule, ZardBadgeComponent, ZardButtonComponent],
  template: `
    <section class="section">
      <header class="section-head">
        <div>
          <span class="eyebrow">Ontology</span>
          <h2>Competencies</h2>
        </div>
        <z-badge zType="outline" zShape="pill">{{ categories().length }} categories</z-badge>
      </header>

      <article class="panel">
        <h3>Create category</h3>
        <div class="form-row">
          <input class="fld" [(ngModel)]="newCatName" placeholder="Category name" />
          <input class="fld" [(ngModel)]="newCatType" placeholder="Type (domain, soft, ...)" />
          <button z-button zType="primary" (click)="createCategory()" [disabled]="!newCatName().trim()">Add category</button>
        </div>
      </article>

      @for (cat of categories(); track cat.id) {
        <article class="panel">
          <header class="panel-header">
            <div>
              <strong>{{ cat.name }}</strong>
              <span class="muted">{{ cat.categoryType }} · {{ cat.competencies.length }}</span>
            </div>
            <button z-button zType="ghost" zSize="sm" (click)="removeCategory(cat.id)">Delete</button>
          </header>

          <div class="form-row compact">
            <input class="fld" [(ngModel)]="compCode" placeholder="code (e.g. IT-X-1)" />
            <input class="fld grow" [(ngModel)]="compName" placeholder="New competency name" />
            <button z-button zType="secondary" zSize="sm"
              (click)="createCompetency(cat.id)" [disabled]="!compCode().trim() || !compName().trim()">
              Add
            </button>
          </div>

          @if (cat.competencies.length) {
            <table class="crud-table">
              <thead><tr><th>Code</th><th>Name</th><th>Status</th><th></th></tr></thead>
              <tbody>
                @for (comp of cat.competencies; track comp.id) {
                  <tr>
                    <td>{{ comp.code }}</td>
                    <td>
                      @if (editingId() === comp.id) {
                        <input class="fld" [(ngModel)]="editName" (keyup.enter)="saveEdit(comp)" />
                      } @else {
                        {{ comp.name }}
                      }
                    </td>
                    <td><z-badge zType="outline" zShape="pill">{{ comp.validationStatus }}</z-badge></td>
                    <td class="actions">
                      @if (editingId() === comp.id) {
                        <button z-button zType="ghost" zSize="sm" (click)="saveEdit(comp)">Save</button>
                        <button z-button zType="ghost" zSize="sm" (click)="cancelEdit()">Cancel</button>
                      } @else {
                        <button z-button zType="ghost" zSize="sm" (click)="startEdit(comp)">Edit</button>
                        <button z-button zType="ghost" zSize="sm" (click)="removeCompetency(comp.id)">Delete</button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="muted">No competencies yet.</p>
          }
        </article>
      }
      @if (!categories().length) {
        <p class="muted">Loading ontology…</p>
      }
    </section>
  `,
  styles: [
    `
      .section { display: grid; gap: 16px; }
      .section-head { display: flex; justify-content: space-between; align-items: center; }
      .panel { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; background: #fff; }
      .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .form-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .form-row.compact { margin: 10px 0; }
      .fld { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
      .fld.grow { flex: 1; min-width: 200px; }
      .crud-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 13px; }
      .crud-table th { text-align: left; color: #64748b; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
      .crud-table td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
      .actions { display: flex; gap: 6px; justify-content: flex-end; }
      .muted { color: #64748b; font-size: 13px; }
      .eyebrow { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
      h2 { margin: 2px 0; }
      h3 { margin: 0 0 8px; font-size: 14px; }
    `,
  ],
})
export class CompetenciesComponent {
  private readonly api = inject(ApiService);
  readonly data = toSignal(this.api.query(OntologyAdminDocument), { initialValue: null });
  readonly categories = computed<readonly Category[]>(() => this.data()?.ontology.categories ?? []);

  readonly newCatName = signal('');
  readonly newCatType = signal('domain');
  readonly compCode = signal('');
  readonly compName = signal('');
  readonly editingId = signal<string | null>(null);
  readonly editName = signal('');

  createCategory() {
    const name = this.newCatName().trim();
    if (!name) return;
    this.api
      .mutate(CreateCompetencyCategoryDocument, {
        input: { organizationId: 'org-demo', categoryType: this.newCatType().trim() || 'domain', name, description: '' },
      })
      .subscribe({ next: () => { this.newCatName.set(''); }, error: (e) => alert(e.message) });
  }

  removeCategory(id: string) {
    if (!confirm('Delete category?')) return;
    this.api.mutate(DeleteCompetencyCategoryDocument, { id }).subscribe({ error: (e) => alert(e.message) });
  }

  createCompetency(categoryId: string) {
    const code = this.compCode().trim();
    const name = this.compName().trim();
    if (!code || !name) return;
    this.api
      .mutate(CreateCompetencyDocument, {
        input: { organizationId: 'org-demo', categoryId, code, name, description: '', tags: [] },
      })
      .subscribe({ next: () => { this.compCode.set(''); this.compName.set(''); }, error: (e) => alert(e.message) });
  }

  startEdit(comp: Competency) {
    this.editingId.set(comp.id);
    this.editName.set(comp.name);
  }
  cancelEdit() {
    this.editingId.set(null);
    this.editName.set('');
  }
  saveEdit(comp: Competency) {
    const name = this.editName().trim();
    if (!name) { this.cancelEdit(); return; }
    this.api
      .mutate(UpdateCompetencyDocument, { input: { id: comp.id, name } })
      .subscribe({ next: () => this.cancelEdit(), error: (e) => alert(e.message) });
  }

  removeCompetency(id: string) {
    if (!confirm('Delete competency?')) return;
    this.api.mutate(DeleteCompetencyDocument, { id }).subscribe({ error: (e) => alert(e.message) });
  }
}
