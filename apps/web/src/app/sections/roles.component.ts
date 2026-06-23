import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CreateGradeDocument,
  CreateRoleDocument,
  CreateRoleFamilyDocument,
  CreateRoleProfileDocument,
  CreateRoleTaskDocument,
  DeleteRoleTaskDocument,
  RolesAdminDocument,
  type RolesAdminQuery,
} from '@comatrix/api-contracts';
import { ApiService } from '../api.service';
import { ZardBadgeComponent } from '../shared/components/badge';
import { ZardButtonComponent } from '../shared/components/button';

type Profile = RolesAdminQuery['roleProfiles'][number];

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [FormsModule, ZardBadgeComponent, ZardButtonComponent],
  template: `
    <section class="section">
      <header class="section-head"><div><span class="eyebrow">Job architecture</span><h2>Roles & profiles</h2></div></header>

      <div class="grid3">
        <article class="panel">
          <h3>Role families</h3>
          <div class="form-row"><input class="fld grow" [(ngModel)]="familyName" placeholder="New family" /><button z-button zType="secondary" zSize="sm" (click)="addFamily()" [disabled]="!familyName().trim()">Add</button></div>
          @for (f of data()?.roleFamilies; track f.id) { <div class="item"><span>{{ f.name }}</span></div> }
        </article>

        <article class="panel">
          <h3>Grades</h3>
          <div class="form-row"><input class="fld" [(ngModel)]="gradeName" placeholder="Name" style="width:90px"/><input class="fld" type="number" [(ngModel)]="gradeRank" placeholder="rank" style="width:70px"/><button z-button zType="secondary" zSize="sm" (click)="addGrade()" [disabled]="!gradeName().trim()">Add</button></div>
          @for (g of data()?.grades; track g.id) { <div class="item"><span>{{ g.name }}</span><z-badge zType="outline" zShape="pill">rank {{ g.rank }}</z-badge></div> }
        </article>

        <article class="panel">
          <h3>Roles</h3>
          <div class="form-row">
            <select class="fld" [(ngModel)]="roleFamily">
              @for (f of data()?.roleFamilies; track f.id) { <option [value]="f.id">{{ f.name }}</option> }
            </select>
            <input class="fld grow" [(ngModel)]="roleName" placeholder="Role name"/>
            <button z-button zType="secondary" zSize="sm" (click)="addRole()" [disabled]="!roleName().trim()">Add</button>
          </div>
          @for (r of data()?.roles; track r.id) { <div class="item"><span>{{ r.name }}</span><span class="muted">{{ r.family?.name }}</span></div> }
        </article>
      </div>

      <article class="panel">
        <h3>Role profiles</h3>
        <div class="form-row">
          <select class="fld" [(ngModel)]="profileRole">
            @for (r of data()?.roles; track r.id) { <option [value]="r.id">{{ r.name }}</option> }
          </select>
          <select class="fld" [(ngModel)]="profileGrade">
            @for (g of data()?.grades; track g.id) { <option [value]="g.id">{{ g.name }}</option> }
          </select>
          <input class="fld grow" [(ngModel)]="profileName" placeholder="Profile name"/>
          <button z-button zType="primary" zSize="sm" (click)="addProfile()" [disabled]="!profileName().trim()">Create profile</button>
        </div>

        @for (p of profiles(); track p.id) {
          <div class="profile">
            <div class="profile-head">
              <strong>{{ p.name }}</strong>
              <span class="muted">{{ p.role?.name }} · {{ p.grade?.name }}</span>
            </div>
            <div class="task-row">
              <input class="fld grow" [(ngModel)]="taskName" placeholder="task name"/>
              <input class="fld grow" [(ngModel)]="taskOutcome" placeholder="expected outcome"/>
              <select class="fld" [(ngModel)]="taskCrit" style="width:110px">
                <option value="high">high</option><option value="medium">medium</option><option value="low">low</option>
              </select>
              <button z-button zType="ghost" zSize="sm" (click)="addTask(p.id)" [disabled]="!taskName().trim()">Add task</button>
            </div>
            @for (t of p.tasks; track t.id) {
              <div class="task"><span>{{ t.name }}</span><span class="muted">{{ t.expectedOutcome }}</span><z-badge zType="outline" zShape="pill">{{ t.criticality }}</z-badge><button z-button zType="ghost" zSize="sm" (click)="removeTask(t.id)">×</button></div>
            }
          </div>
        }
      </article>
    </section>
  `,
  styles: [`section{display:grid;gap:16px}.section-head{display:flex;justify-content:space-between}.panel{border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;background:#fff}.grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.form-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.fld{padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px}.fld.grow{flex:1;min-width:120px}.item{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:13px}.profile{border-top:1px solid #e2e8f0;padding:10px 0}.profile-head{display:flex;gap:8px;align-items:baseline;margin-bottom:6px}.task-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}.task{display:flex;gap:8px;align-items:center;font-size:13px;padding:4px 0}.muted{color:#64748b}.eyebrow{color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.04em}h2{margin:2px 0}h3{margin:0 0 8px;font-size:14px}`],
})
export class RolesComponent {
  private readonly api = inject(ApiService);
  readonly data = toSignal(this.api.query(RolesAdminDocument), { initialValue: null });
  readonly profiles = computed<readonly Profile[]>(() => this.data()?.roleProfiles ?? []);

  readonly familyName = signal('');
  readonly gradeName = signal(''); readonly gradeRank = signal(1);
  readonly roleFamily = signal(''); readonly roleName = signal('');
  readonly profileRole = signal(''); readonly profileGrade = signal(''); readonly profileName = signal('');
  readonly taskName = signal(''); readonly taskOutcome = signal(''); readonly taskCrit = signal('medium');

  addFamily() { const n = this.familyName().trim(); if (!n) return; this.api.mutate(CreateRoleFamilyDocument, { input: { organizationId: 'org-demo', name: n } }).subscribe({ next: () => this.familyName.set(''), error: (e) => alert(e.message) }); }
  addGrade() { const n = this.gradeName().trim(); if (!n) return; this.api.mutate(CreateGradeDocument, { input: { organizationId: 'org-demo', name: n, rank: Number(this.gradeRank()) } }).subscribe({ next: () => this.gradeName.set(''), error: (e) => alert(e.message) }); }
  addRole() { const n = this.roleName().trim(); if (!n || !this.roleFamily()) return; this.api.mutate(CreateRoleDocument, { input: { roleFamilyId: this.roleFamily(), name: n } }).subscribe({ next: () => this.roleName.set(''), error: (e) => alert(e.message) }); }
  addProfile() { const n = this.profileName().trim(); if (!n) return; this.api.mutate(CreateRoleProfileDocument, { input: { roleId: this.profileRole(), gradeId: this.profileGrade(), name: n, description: '' } }).subscribe({ next: () => this.profileName.set(''), error: (e) => alert(e.message) }); }
  addTask(profileId: string) { const n = this.taskName().trim(); if (!n) return; this.api.mutate(CreateRoleTaskDocument, { input: { roleProfileId: profileId, name: n, expectedOutcome: this.taskOutcome() || n, criticality: this.taskCrit() } }).subscribe({ next: () => { this.taskName.set(''); this.taskOutcome.set(''); }, error: (e) => alert(e.message) }); }
  removeTask(id: string) { this.api.mutate(DeleteRoleTaskDocument, { id }).subscribe({ error: (e) => alert(e.message) }); }
}
