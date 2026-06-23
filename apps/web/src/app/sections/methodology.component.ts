import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CreateLevelScaleDocument, CreateScoringRuleOpDocument, LevelScalesDetailedDocument, ScoringRulesListDocument, SetDefaultScoringRuleDocument, UpsertLevelDimensionDescriptorDocument, type LevelScalesDetailedQuery, type ScoringRulesListQuery } from '@comatrix/api-contracts';
import { ApiService } from '../api.service';
import { ZardBadgeComponent } from '../shared/components/badge';
import { ZardButtonComponent } from '../shared/components/button';

@Component({
  selector: 'app-methodology-section',
  standalone: true,
  imports: [FormsModule, ZardBadgeComponent, ZardButtonComponent],
  template: `
    <section class="section">
      <header class="section-head"><div><span class="eyebrow">Methodology</span><h2>Scales & scoring</h2></div></header>

      <article class="panel">
        <h3>Level scales</h3>
        <div class="form-row"><input class="fld grow" [(ngModel)]="newScale" placeholder="New scale name"/><button z-button zType="primary" zSize="sm" (click)="addScale()" [disabled]="!newScale().trim()">Create scale</button></div>
        @for (s of scales(); track s.id) {
          <div class="block">
            <div class="form-row"><strong>{{ s.name }}</strong> @if (s.isDefault) { <z-badge zType="secondary" zShape="pill">default</z-badge> }</div>
            <div class="form-row">
              <input class="fld sm" type="number" min="0" max="5" [(ngModel)]="dimLevel" placeholder="lvl"/>
              <select class="fld" [(ngModel)]="dimName"><option value="autonomy">autonomy</option><option value="complexity">complexity</option><option value="influence">influence</option><option value="support">support</option><option value="impact">impact</option></select>
              <input class="fld grow" [(ngModel)]="dimDesc" placeholder="what it looks like"/>
              <button z-button zType="secondary" zSize="sm" (click)="addDim(s.id)" [disabled]="!dimDesc().trim()">Add dimension</button>
            </div>
            @for (d of s.dimensionDescriptors; track d.id) { <div class="item"><span>L{{ d.levelValue }} · {{ d.dimension }}</span><span class="muted">{{ d.description }}</span></div> }
          </div>
        }
      </article>

      <article class="panel">
        <h3>Scoring rules</h3>
        <div class="form-row"><input class="fld" [(ngModel)]="ruleName" placeholder="rule name" style="width:160px"/><input class="fld sm" type="number" step="0.05" [(ngModel)]="ruleConf" placeholder="conf"/><button z-button zType="secondary" zSize="sm" (click)="addRule()" [disabled]="!ruleName().trim()">Add</button></div>
        @for (r of rules(); track r.id) { <div class="item"><span>{{ r.name }} (conf ≥ {{ r.confidenceThreshold }})</span>
          <div class="form-row"><z-badge zType="outline" zShape="pill">{{ r.status }}</z-badge>
            @if (!r.isDefault) { <button z-button zType="ghost" zSize="sm" (click)="setDefault(r.id)">Set default</button> }
            @else { <z-badge zType="secondary" zShape="pill">default</z-badge> }</div></div> }
      </article>
    </section>
  `,
  styles: [`section{display:grid;gap:16px}.section-head{display:flex;justify-content:space-between}.panel{border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;background:#fff}.block{border-top:1px solid #e2e8f0;padding:10px 0}.form-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.fld{padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px}.fld.grow{flex:1;min-width:120px}.fld.sm{width:64px}.item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px}.muted{color:#64748b;font-size:13px}.eyebrow{color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.04em}h2{margin:2px 0}h3{margin:0 0 8px;font-size:14px}`],
})
export class MethodologySectionComponent {
  private readonly api = inject(ApiService);
  readonly scalesData = toSignal(this.api.query(LevelScalesDetailedDocument), { initialValue: null });
  readonly rulesData = toSignal(this.api.query(ScoringRulesListDocument), { initialValue: null });
  readonly scales = computed<readonly LevelScalesDetailedQuery['levelScales'][number][]>(() => this.scalesData()?.levelScales ?? []);
  readonly rules = computed<readonly ScoringRulesListQuery['scoringRules'][number][]>(() => this.rulesData()?.scoringRules ?? []);
  readonly newScale = signal(''); readonly dimLevel = signal(3); readonly dimName = signal('autonomy'); readonly dimDesc = signal('');
  readonly ruleName = signal(''); readonly ruleConf = signal(0.7);
  addScale() { const n = this.newScale().trim(); if (!n) return; this.api.mutate(CreateLevelScaleDocument, { input: { organizationId: 'org-demo', name: n } }).subscribe({ next: () => this.newScale.set(''), error: (e) => alert(e.message) }); }
  addDim(scaleId: string) { const d = this.dimDesc().trim(); if (!d) return; this.api.mutate(UpsertLevelDimensionDescriptorDocument, { input: { scaleId, levelValue: Number(this.dimLevel()), dimension: this.dimName(), description: d } }).subscribe({ next: () => this.dimDesc.set(''), error: (e) => alert(e.message) }); }
  addRule() { const n = this.ruleName().trim(); if (!n) return; this.api.mutate(CreateScoringRuleOpDocument, { input: { organizationId: 'org-demo', name: n, confidenceThreshold: Number(this.ruleConf()) } }).subscribe({ next: () => this.ruleName.set(''), error: (e) => alert(e.message) }); }
  setDefault(id: string) { this.api.mutate(SetDefaultScoringRuleDocument, { id }).subscribe({ error: (e) => alert(e.message) }); }
}
