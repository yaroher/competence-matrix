import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { DevelopmentAdminDocument, UpdateDevelopmentPlanItemDocument } from '@comatrix/api-contracts';
import { ApiService } from '../api.service';
import { ToastService } from '../toast.service';
import { I18nService } from '../i18n/i18n.service';
import { TrPipe } from '../i18n/tr.pipe';
import { ZardBadgeComponent } from '../shared/components/badge';
import { ZardButtonComponent } from '../shared/components/button';

@Component({
  selector: 'app-development',
  standalone: true,
  imports: [FormsModule, ZardBadgeComponent, ZardButtonComponent, TrPipe],
  template: `
    <section class="section">
      <header class="section-head"><div><span class="eyebrow">{{ 'dev.subtitle' | tr }}</span><h2>{{ 'dev.title' | tr }}</h2></div></header>
      <article class="panel">
        <div class="form-row">
          <label class="muted">{{ 'dev.assessment' | tr }}</label>
          <select class="fld grow" [value]="assessmentId()" (change)="assessmentId.set($any($event.target).value)">
            @for (a of assessments(); track a.id) { <option [value]="a.id">{{ a.person?.fullName }} ({{ a.status }})</option> }
          </select>
        </div>
      </article>
      @if (plan(); as p) {
        <article class="panel">
          <header class="panel-head"><div><strong>{{ p.person?.fullName }}</strong> <span class="muted">{{ p.assessment?.status }}</span></div></header>
          @if (p.items.length) {
            <table class="crud"><thead><tr><th>{{ 'common.name' | tr }}</th><th>{{ 'dash.gap' | tr }}</th><th>{{ 'common.status' | tr }}</th><th>{{ 'dev.due' | tr }}</th><th></th></tr></thead><tbody>
              @for (it of p.items; track it.id) {
                <tr>
                  <td>{{ it.title }}</td><td>{{ it.gap }}</td>
                  <td><select class="fld" [value]="it.status" (change)="update(it.id, $any($event.target).value, it.dueDate)">
                    <option value="planned">planned</option><option value="in_progress">in_progress</option><option value="done">done</option>
                  </select></td>
                  <td><input class="fld" type="date" [value]="it.dueDate" (change)="update(it.id, it.status, $any($event.target).value)"/></td>
                  <td><z-badge zType="outline" zShape="pill">{{ it.competency?.code }}</z-badge></td>
                </tr>
              }
            </tbody></table>
          } @else { <p class="muted">{{ 'dev.noItems' | tr }}</p> }
        </article>
      } @else { <p class="muted">{{ 'dev.selectAssessment' | tr }}</p> }
    </section>
  `,
  styles: [`section{display:grid;gap:16px}.section-head{display:flex;justify-content:space-between}.panel{border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;background:#fff}.panel-head{display:flex;justify-content:space-between;margin-bottom:8px}.form-row{display:flex;gap:8px;align-items:center}.fld{padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px}.fld.grow{flex:1}.crud{width:100%;border-collapse:collapse;font-size:13px}.crud th{text-align:left;color:#64748b;padding:6px 8px;border-bottom:1px solid #e2e8f0}.crud td{padding:6px 8px;border-bottom:1px solid #f1f5f9}.muted{color:#64748b;font-size:13px}.eyebrow{color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.04em}h2{margin:2px 0}`],
})
export class DevelopmentComponent {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  readonly assessmentId = signal('assessment-alexey-backend-go-senior');
  readonly data = toSignal(toObservable(this.assessmentId).pipe(switchMap((id) => this.api.query(DevelopmentAdminDocument, { assessmentId: id }))), { initialValue: null });
  readonly assessments = computed(() => this.data()?.assessments ?? []);
  readonly plan = computed(() => this.data()?.developmentPlan ?? null);
  update(id: string, status: string, dueDate: string) {
    this.api.mutate(UpdateDevelopmentPlanItemDocument, { input: { id, status, dueDate } }).subscribe({ error: (e) => this.toast.error(e.message) });
  }
}
