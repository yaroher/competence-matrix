import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CreateMatrixDocument,
  DeleteMatrixRequirementDocument,
  MatricesAdminDocument,
  UpsertMatrixRequirementDocument,
  type MatricesAdminQuery,
} from '@comatrix/api-contracts';
import { ApiService } from '../api.service';
import { ToastService } from '../toast.service';
import { I18nService } from '../i18n/i18n.service';
import { TrPipe } from '../i18n/tr.pipe';
import { ZardBadgeComponent } from '../shared/components/badge';
import { ZardButtonComponent } from '../shared/components/button';

type Matrix = MatricesAdminQuery['matrices'][number];

@Component({
  selector: 'app-matrices',
  standalone: true,
  imports: [FormsModule, ZardBadgeComponent, ZardButtonComponent, TrPipe],
  template: `
    <section class="section">
      <header class="section-head"><div><span class="eyebrow">{{ 'matrices.subtitle' | tr }}</span><h2>{{ 'matrices.title' | tr }}</h2></div></header>

      <article class="panel">
        <h3>{{ 'matrices.new' | tr }}</h3>
        <div class="form-row">
          <select class="fld" [(ngModel)]="newProfile">
            @for (p of data()?.roleProfiles; track p.id) { <option [value]="p.id">{{ p.name }}</option> }
          </select>
          <input class="fld grow" [(ngModel)]="newName" placeholder="{{ 'matrices.matrixName' | tr }}"/>
          <button z-button zType="primary" zSize="sm" (click)="create()" [disabled]="!newName().trim()">{{ 'common.create' | tr }}</button>
        </div>
      </article>

      @for (m of matrices(); track m.id) {
        <article class="panel">
          <header class="panel-head">
            <div><strong>{{ m.name }}</strong> <span class="muted">{{ m.roleProfile?.name }}</span></div>
            <z-badge zType="secondary" zShape="pill">{{ m.status }}</z-badge>
          </header>

          <div class="form-row">
            <select class="fld grow" [(ngModel)]="reqComp">
              @for (c of comps(); track c.id) { <option [value]="c.id">{{ c.code }} · {{ c.name }}</option> }
            </select>
            <label class="muted">{{ 'matrices.target' }} <input class="fld sm" type="number" min="0" max="5" [(ngModel)]="reqLevel"/></label>
            <label class="muted">{{ 'matrices.weight' }} <input class="fld sm" type="number" step="0.01" [(ngModel)]="reqWeight"/></label>
            <select class="fld" [(ngModel)]="reqCrit" style="width:110px"><option value="high">high</option><option value="medium">medium</option><option value="low">low</option></select>
            <button z-button zType="secondary" zSize="sm" (click)="addReq(m)" [disabled]="!reqComp()">{{ 'matrices.addRequirement' | tr }}</button>
          </div>

          @if (m.activeRevision?.requirements.length) {
            <table class="crud">
              <thead><tr><th>{{ 'analytics.competency' | tr }}</th><th>{{ 'matrices.target' | tr }}</th><th>{{ 'matrices.weight' | tr }}</th><th>{{ 'analytics.criticality' | tr }}</th><th></th></tr></thead>
              <tbody>
                @for (r of m.activeRevision.requirements; track r.id) {
                  <tr><td>{{ r.competency?.code }}</td><td>{{ r.targetLevel }}</td><td>{{ r.normalizedWeight }}</td><td>{{ r.criticality }}</td>
                    <td><button z-button zType="ghost" zSize="sm" (click)="removeReq(r.id)">×</button></td></tr>
                }
              </tbody>
            </table>
          } @else { <p class="muted">{{ 'matrices.noRequirements' | tr }}</p> }
        </article>
      }
    </section>
  `,
  styles: [`section{display:grid;gap:16px}.section-head{display:flex;justify-content:space-between}.panel{border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;background:#fff}.panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.form-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.fld{padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px}.fld.grow{flex:1;min-width:160px}.fld.sm{width:64px}.crud{width:100%;border-collapse:collapse;font-size:13px}.crud th{text-align:left;color:#64748b;padding:6px 8px;border-bottom:1px solid #e2e8f0}.crud td{padding:6px 8px;border-bottom:1px solid #f1f5f9}.muted{color:#64748b;font-size:13px}.eyebrow{color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.04em}h2{margin:2px 0}h3{margin:0 0 8px;font-size:14px}`],
})
export class MatricesComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  readonly data = toSignal(this.api.query(MatricesAdminDocument), { initialValue: null });
  readonly matrices = computed<readonly Matrix[]>(() => this.data()?.matrices ?? []);
  readonly comps = computed(() => this.data()?.competencies.competencies ?? []);

  readonly newProfile = signal(''); readonly newName = signal('');
  readonly reqComp = signal(''); readonly reqLevel = signal(3); readonly reqWeight = signal(0.05); readonly reqCrit = signal('medium');

  create() { const n = this.newName().trim(); if (!n) return; this.api.mutate(CreateMatrixDocument, { input: { roleProfileId: this.newProfile(), name: n } }).subscribe({ next: () => this.newName.set(''), error: (e) => this.toast.error(e.message) }); }
  addReq(m: Matrix) { if (!this.reqComp() || !m.activeRevision) return; this.api.mutate(UpsertMatrixRequirementDocument, { input: { revisionId: m.activeRevision.id, competencyId: this.reqComp(), targetLevel: Number(this.reqLevel()), normalizedWeight: Number(this.reqWeight()), criticality: this.reqCrit(), neededOnEntry: false } }).subscribe({ error: (e) => this.toast.error(e.message) }); }
  removeReq(id: string) { this.api.mutate(DeleteMatrixRequirementDocument, { id }).subscribe({ error: (e) => this.toast.error(e.message) }); }
}
