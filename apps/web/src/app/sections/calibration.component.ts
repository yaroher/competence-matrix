import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AddCalibrationDecisionDocument, CalibrationSessionsDetailedDocument, CloseCalibrationSessionDocument, CreateCalibrationSessionDocument, DeleteCalibrationDecisionDocument, type CalibrationSessionsDetailedQuery } from '@comatrix/api-contracts';
import { ApiService } from '../api.service';
import { ZardBadgeComponent } from '../shared/components/badge';
import { ZardButtonComponent } from '../shared/components/button';

type Session = CalibrationSessionsDetailedQuery['calibrationSessions'][number];

@Component({
  selector: 'app-calibration-section',
  standalone: true,
  imports: [FormsModule, ZardBadgeComponent, ZardButtonComponent],
  template: `
    <section class="section">
      <header class="section-head"><div><span class="eyebrow">Calibration</span><h2>Sessions</h2></div></header>
      <article class="panel">
        <div class="form-row"><input class="fld grow" [(ngModel)]="newSession" placeholder="New session name"/><button z-button zType="primary" zSize="sm" (click)="createSession()" [disabled]="!newSession().trim()">Create</button></div>
      </article>
      @for (s of sessions(); track s.id) {
        <article class="panel">
          <header class="panel-head"><div><strong>{{ s.name }}</strong></div><div class="form-row"><z-badge zType="secondary" zShape="pill">{{ s.status }}</z-badge>
            @if (s.status==='open') { <button z-button zType="ghost" zSize="sm" (click)="close(s.id)">Close</button> }</div></header>

          <div class="form-row">
            <select class="fld grow" [(ngModel)]="scoreId"><option [ngValue]="''">select score…</option>
              @for (a of data()?.assessments; track a.id) { @for (sc of a.scores; track sc.id) { <option [value]="sc.id">{{ a.person?.fullName }} · {{ sc.competency?.name }} ({{ sc.source }}={{ sc.level }})</option> } }
            </select>
            <input class="fld sm" type="number" min="0" max="5" [(ngModel)]="origLevel" placeholder="orig"/>
            <input class="fld sm" type="number" min="0" max="5" [(ngModel)]="calLevel" placeholder="new"/>
            <input class="fld grow" [(ngModel)]="reason" placeholder="reason"/>
            <button z-button zType="secondary" zSize="sm" (click)="addDecision(s.id)" [disabled]="!scoreId()">Add</button>
          </div>
          @if (s.decisions.length) {
            <table class="crud"><thead><tr><th>Score</th><th>Orig</th><th>Calib</th><th>Diff</th><th>Reason</th><th></th></tr></thead><tbody>
              @for (d of s.decisions; track d.id) { <tr><td>{{ d.score?.competency?.name }}</td><td>{{ d.originalLevel }}</td><td>{{ d.calibratedLevel }}</td><td>{{ d.diff>0?'+':'' }}{{ d.diff }}</td><td>{{ d.reason }}</td><td><button z-button zType="ghost" zSize="sm" (click)="remove(d.id)">×</button></td></tr> }
            </tbody></table>
          } @else { <p class="muted">No decisions yet.</p> }
        </article>
      }
    </section>
  `,
  styles: [`section{display:grid;gap:16px}.section-head{display:flex;justify-content:space-between}.panel{border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;background:#fff}.panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.form-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.fld{padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px}.fld.grow{flex:1;min-width:120px}.fld.sm{width:60px}.crud{width:100%;border-collapse:collapse;font-size:13px}.crud th{text-align:left;color:#64748b;padding:6px 8px;border-bottom:1px solid #e2e8f0}.crud td{padding:6px 8px;border-bottom:1px solid #f1f5f9}.muted{color:#64748b;font-size:13px}.eyebrow{color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.04em}h2{margin:2px 0}`],
})
export class CalibrationSectionComponent {
  private readonly api = inject(ApiService);
  readonly data = toSignal(this.api.query(CalibrationSessionsDetailedDocument), { initialValue: null });
  readonly sessions = computed<readonly Session[]>(() => this.data()?.calibrationSessions ?? []);
  readonly newSession = signal('');
  readonly scoreId = signal(''); readonly origLevel = signal(3); readonly calLevel = signal(4); readonly reason = signal('');
  createSession() { const n = this.newSession().trim(); if (!n) return; this.api.mutate(CreateCalibrationSessionDocument, { input: { organizationId: 'org-demo', name: n } }).subscribe({ next: () => this.newSession.set(''), error: (e) => alert(e.message) }); }
  close(id: string) { this.api.mutate(CloseCalibrationSessionDocument, { id }).subscribe({ error: (e) => alert(e.message) }); }
  addDecision(sessionId: string) { if (!this.scoreId()) return; this.api.mutate(AddCalibrationDecisionDocument, { input: { sessionId, assessmentScoreId: this.scoreId(), originalLevel: Number(this.origLevel()), calibratedLevel: Number(this.calLevel()), reason: this.reason() } }).subscribe({ next: () => this.reason.set(''), error: (e) => alert(e.message) }); }
  remove(id: string) { this.api.mutate(DeleteCalibrationDecisionDocument, { id }).subscribe({ error: (e) => alert(e.message) }); }
}
