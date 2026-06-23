import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { PeopleAssignmentsDocument, type PeopleAssignmentsQuery } from '@comatrix/api-contracts';
import { CreateAssignmentOpDocument, CreateOrgUnitOpDocument, CreatePersonDocument, UpdatePersonOpDocument } from '@comatrix/api-contracts';
import { ApiService } from '../api.service';
import { I18nService } from '../i18n/i18n.service';
import { TrPipe } from '../i18n/tr.pipe';
import { ZardBadgeComponent } from '../shared/components/badge';
import { ZardButtonComponent } from '../shared/components/button';

@Component({
  selector: 'app-admin-section',
  standalone: true,
  imports: [FormsModule, ZardBadgeComponent, ZardButtonComponent, TrPipe],
  template: `
    <section class="section">
      <header class="section-head"><div><span class="eyebrow">{{ 'admin.subtitle' | tr }}</span><h2>{{ 'admin.title' | tr }}</h2></div></header>
      <div class="grid3">
        <article class="panel">
          <h3>{{ 'admin.people' | tr }}</h3>
          <div class="form-row"><input class="fld grow" [(ngModel)]="personName" placeholder="{{ 'common.name' | tr }}"/><input class="fld grow" [(ngModel)]="personEmail" placeholder="{{ 'admin.email' | tr }}"/><button z-button zType="secondary" zSize="sm" (click)="addPerson()" [disabled]="!personName().trim()||!personEmail().trim()">{{ 'common.add' | tr }}</button></div>
          @for (p of people(); track p.id) { <div class="item"><div><strong>{{ p.fullName }}</strong><div class="muted">{{ p.email }}</div></div>
            <select class="fld sm" [value]="p.status" (change)="updateStatus(p.id, $any($event.target).value)"><option value="active">active</option><option value="inactive">inactive</option></select></div> }
        </article>

        <article class="panel">
          <h3>{{ 'admin.orgUnits' | tr }}</h3>
          <div class="form-row">
            <select class="fld" [(ngModel)]="unitParent"><option [ngValue]="null">{{ 'admin.root' | tr }}</option>@for (u of orgUnits(); track u.id) { <option [value]="u.id">{{ u.name }}</option> }</select>
            <select class="fld" [(ngModel)]="unitType"><option value="department">department</option><option value="team">team</option><option value="company">company</option></select>
            <input class="fld grow" [(ngModel)]="unitName" placeholder="{{ 'common.name' | tr }}"/>
            <button z-button zType="secondary" zSize="sm" (click)="addUnit()" [disabled]="!unitName().trim()">{{ 'common.add' | tr }}</button>
          </div>
          @for (u of orgUnits(); track u.id) { <div class="item"><span>{{ u.name }}</span><z-badge zType="outline" zShape="pill">{{ u.type }}</z-badge></div> }
        </article>

        <article class="panel">
          <h3>{{ 'admin.assignments' | tr }}</h3>
          <div class="form-row">
            <select class="fld grow" [(ngModel)]="asgPerson">@for (p of people(); track p.id) { <option [value]="p.id">{{ p.fullName }}</option> }</select>
            <select class="fld grow" [(ngModel)]="asgUnit">@for (u of orgUnits(); track u.id) { <option [value]="u.id">{{ u.name }}</option> }</select>
            <input class="fld" type="date" [(ngModel)]="asgFrom"/>
            <button z-button zType="secondary" zSize="sm" (click)="addAsg()" [disabled]="!asgPerson()||!asgUnit()">{{ 'admin.assign' | tr }}</button>
          </div>
          @for (p of people(); track p.id) { @if (p.currentAssignment; as a) { <div class="item"><span>{{ p.fullName }}</span><span class="muted">{{ a.orgUnit?.name }} · {{ a.roleProfile?.name }}</span></div> } }
        </article>
      </div>
    </section>
  `,
  styles: [`section{display:grid;gap:16px}.section-head{display:flex;justify-content:space-between}.grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.panel{border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;background:#fff}.form-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.fld{padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px}.fld.grow{flex:1;min-width:90px}.fld.sm{width:84px}.item{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px}.muted{color:#64748b;font-size:12px}.eyebrow{color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.04em}h2{margin:2px 0}h3{margin:0 0 8px;font-size:14px}`],
})
export class AdminSectionComponent {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  readonly data = toSignal(this.api.query(PeopleAssignmentsDocument), { initialValue: null });
  readonly people = computed<readonly PeopleAssignmentsQuery['people'][number][]>(() => this.data()?.people ?? []);
  readonly orgUnits = computed<readonly PeopleAssignmentsQuery['orgUnits'][number][]>(() => this.data()?.orgUnits ?? []);

  readonly personName = signal(''); readonly personEmail = signal('');
  readonly unitParent = signal<string | null>(null); readonly unitType = signal('team'); readonly unitName = signal('');
  readonly asgPerson = signal(''); readonly asgUnit = signal(''); readonly asgFrom = signal(new Date().toISOString().slice(0, 10));

  addPerson() { this.api.mutate(CreatePersonDocument, { input: { fullName: this.personName(), email: this.personEmail() } }).subscribe({ next: () => { this.personName.set(''); this.personEmail.set(''); }, error: (e) => alert(e.message) }); }
  updateStatus(id: string, status: string) { this.api.mutate(UpdatePersonOpDocument, { input: { id, status } }).subscribe({ error: (e) => alert(e.message) }); }
  addUnit() { this.api.mutate(CreateOrgUnitOpDocument, { input: { organizationId: 'org-demo', parentId: this.unitParent(), type: this.unitType(), name: this.unitName() } }).subscribe({ next: () => this.unitName.set(''), error: (e) => alert(e.message) }); }
  addAsg() { this.api.mutate(CreateAssignmentOpDocument, { input: { personId: this.asgPerson(), orgUnitId: this.asgUnit(), roleProfileId: 'profile-backend-go-senior', effectiveFrom: this.asgFrom() } }).subscribe({ next: () => { this.asgPerson.set(''); this.asgUnit.set(''); }, error: (e) => alert(e.message) }); }
}
