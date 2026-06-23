import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AssessmentsAdminDocument,
  CreateAssessmentDocument,
  FinalizeAssessmentAdminDocument,
  UpsertAssessmentScoreDocument,
  type AssessmentsAdminQuery,
} from '@comatrix/api-contracts';
import { ApiService } from '../api.service';
import { ZardBadgeComponent } from '../shared/components/badge';
import { ZardButtonComponent } from '../shared/components/button';

type Assessment = AssessmentsAdminQuery['assessments'][number];
type Score = Assessment['scores'][number];

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [FormsModule, ZardBadgeComponent, ZardButtonComponent],
  template: `
    <section class="section">
      <header class="section-head"><div><span class="eyebrow">Workspace</span><h2>Assessments</h2></div></header>

      <article class="panel">
        <h3>New assessment</h3>
        <div class="form-row">
          <select class="fld" [(ngModel)]="newPerson">@for (p of data()?.people; track p.id) { <option [value]="p.id">{{ p.fullName }}</option> }</select>
          <select class="fld" [(ngModel)]="newProfile">@for (p of data()?.roleProfiles; track p.id) { <option [value]="p.id">{{ p.name }}</option> }</select>
          <select class="fld" [(ngModel)]="newRevision">@for (m of data()?.matrices; track m.id) { <option [value]="m.activeRevision.id">{{ m.name }}</option> }</select>
          <button z-button zType="primary" zSize="sm" (click)="create()">Create</button>
        </div>
      </article>

      @for (a of assessments(); track a.id) {
        <article class="panel">
          <header class="panel-head">
            <div><strong>{{ a.person?.fullName }}</strong> <span class="muted">{{ a.roleProfile?.name }}</span></div>
            <div class="form-row"><z-badge zType="secondary" zShape="pill">{{ a.status }}</z-badge>
              <button z-button zType="ghost" zSize="sm" (click)="finalize(a.id)" [disabled]="a.status==='finalized'">Finalize</button></div>
          </header>

          <div class="form-row">
            <select class="fld grow" [(ngModel)]="scoreComp"><option [ngValue]="null">select competency…</option>@for (c of comps(); track c.id) { <option [value]="c.id">{{ c.code }} · {{ c.name }}</option> }</select>
            <select class="fld" [(ngModel)]="scoreSource"><option value="self">self</option><option value="manager">manager</option><option value="expert">expert</option><option value="final">final</option></select>
            <label class="muted">level <input class="fld sm" type="number" min="0" max="5" [(ngModel)]="scoreLevel"/></label>
            <button z-button zType="secondary" zSize="sm" (click)="saveScore(a)" [disabled]="!scoreComp()">Save score</button>
          </div>

          @if (a.scores.length) {
            <table class="crud"><thead><tr><th>Competency</th><th>Source</th><th>Level</th><th>Conf.</th></tr></thead><tbody>
              @for (s of a.scores; track s.id) { <tr><td>{{ s.competency?.code }}</td><td>{{ s.source }}</td><td>{{ s.level }}</td><td>{{ s.confidence }}</td></tr> }
            </tbody></table>
          } @else { <p class="muted">No scores yet.</p> }
        </article>
      }
    </section>
  `,
  styles: [`section{display:grid;gap:16px}.section-head{display:flex;justify-content:space-between}.panel{border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;background:#fff}.panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.form-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.fld{padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px}.fld.grow{flex:1;min-width:160px}.fld.sm{width:56px}.crud{width:100%;border-collapse:collapse;font-size:13px}.crud th{text-align:left;color:#64748b;padding:6px 8px;border-bottom:1px solid #e2e8f0}.crud td{padding:6px 8px;border-bottom:1px solid #f1f5f9}.muted{color:#64748b;font-size:13px}.eyebrow{color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.04em}h2{margin:2px 0}h3{margin:0 0 8px;font-size:14px}`],
})
export class AssessmentsComponent {
  private readonly api = inject(ApiService);
  readonly data = toSignal(this.api.query(AssessmentsAdminDocument), { initialValue: null });
  readonly assessments = computed<readonly Assessment[]>(() => this.data()?.assessments ?? []);
  readonly comps = computed<readonly { id: string; code: string; name: string }[]>(() => this.data()?.competencies.competencies ?? []);

  readonly newPerson = signal(''); readonly newProfile = signal(''); readonly newRevision = signal('');
  readonly scoreComp = signal<string | null>(null); readonly scoreSource = signal('self'); readonly scoreLevel = signal(3);

  create() { this.api.mutate(CreateAssessmentDocument, { input: { personId: this.newPerson(), roleProfileId: this.newProfile(), matrixRevisionId: this.newRevision() } }).subscribe({ error: (e) => alert(e.message) }); }
  saveScore(a: Assessment) { const c = this.scoreComp(); if (!c) return; this.api.mutate(UpsertAssessmentScoreDocument, { input: { assessmentId: a.id, competencyId: c, source: this.scoreSource(), level: Number(this.scoreLevel()), confidence: 0.7, verificationStatus: 'unverified', comment: '' } }).subscribe({ error: (e) => alert(e.message) }); }
  finalize(id: string) { if (!confirm('Finalize assessment?')) return; this.api.mutate(FinalizeAssessmentAdminDocument, { id }).subscribe({ error: (e) => alert(e.message) }); }
}
