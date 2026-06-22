import { DecimalPipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService, DEV_PERSONAS, GapVm, MatrixRequirementVm, PeopleAssignmentsVm, ScoreVm, activeUserId } from './api.service';
import { ZardBadgeComponent } from './shared/components/badge';
import { ZardButtonComponent } from './shared/components/button';
import { ZardCardComponent } from './shared/components/card';
import {
  ZardTableBodyComponent,
  ZardTableCaptionComponent,
  ZardTableCellComponent,
  ZardTableComponent,
  ZardTableHeadComponent,
  ZardTableHeaderComponent,
  ZardTableRowComponent,
} from './shared/components/table';

type OrgUnit = PeopleAssignmentsVm['orgUnits'][number];
interface OrgUnitNode extends OrgUnit {
  children: OrgUnitNode[];
}

@Component({
  selector: 'cmx-root',
  standalone: true,
  imports: [
    DecimalPipe,
    NgClass,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardCardComponent,
    ZardTableBodyComponent,
    ZardTableCaptionComponent,
    ZardTableCellComponent,
    ZardTableComponent,
    ZardTableHeadComponent,
    ZardTableHeaderComponent,
    ZardTableRowComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly api = inject(ApiService);
  readonly selectedNav = signal('Dashboard');
  readonly data = toSignal(this.api.loadMvpData());
  readonly people = toSignal(this.api.loadPeopleAssignments());

  readonly actorAssignment = computed(() => this.people()?.currentActor?.person?.currentAssignment ?? null);
  readonly orgUnitCount = computed(() => this.people()?.orgUnits?.length ?? 0);

  readonly adminPeople = computed(() => this.people()?.people ?? []);
  readonly calibrationSessions = computed(() => this.people()?.calibrationSessions ?? []);
  readonly levelScales = computed(() => this.people()?.levelScales ?? []);
  readonly scoringRules = computed(() => this.people()?.scoringRules ?? []);
  readonly defaultScoringRule = computed(() => this.scoringRules().find((rule) => rule.isDefault) ?? null);
  readonly orgGapSummary = computed(() => this.people()?.organizationGapSummary ?? null);
  readonly auditEvents = computed(() => this.people()?.auditEvents ?? []);
  readonly actor = computed(() => this.people()?.currentActor ?? null);
  readonly personas = DEV_PERSONAS;
  readonly activeUserId = activeUserId;

  switchUser(id: string) {
    this.api.setActiveUser(id);
    location.reload();
  }
  readonly selectedAdminPersonId = signal<string | null>(null);
  readonly selectedAdminPerson = computed(() => {
    const id = this.selectedAdminPersonId();
    if (!id) {
      return this.adminPeople()[0] ?? null;
    }
    return this.adminPeople().find((person) => person.id === id) ?? null;
  });

  readonly orgUnitTree = computed(() => {
    const units = this.people()?.orgUnits ?? [];
    const byId = new Map(units.map((unit) => [unit.id, { ...unit, children: [] as OrgUnitNode[] }]));
    const roots: OrgUnitNode[] = [];
    for (const node of byId.values()) {
      const parent = node.parentId ? byId.get(node.parentId) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  });

  readonly adminError = computed(() => (this.adminPeople().length === 0 && this.data() ? 'No people found' : null));

  readonly topGaps = computed(() => {
    return [...(this.data()?.assessment.gaps ?? [])].sort((a, b) => b.weightedGap - a.weightedGap).slice(0, 6);
  });

  readonly scoreRows = computed(() => {
    const scores = this.data()?.assessment.scores ?? [];
    const grouped = new Map<string, { competency: string; self?: ScoreVm; manager?: ScoreVm; final?: ScoreVm }>();

    for (const score of scores) {
      const row = grouped.get(score.competency.id) ?? { competency: score.competency.name };
      if (score.source === 'self') {
        row.self = score;
      }
      if (score.source === 'manager') {
        row.manager = score;
      }
      if (score.source === 'final') {
        row.final = score;
      }
      grouped.set(score.competency.id, row);
    }

    return Array.from(grouped.values()).slice(0, 8);
  });

  navItems = [
    'Dashboard',
    'Competencies',
    'Roles',
    'Matrices',
    'Assessments',
    'Calibration',
    'Development',
    'Analytics',
    'Methodology',
    'Audit',
    'Admin',
  ];

  requirementTrack(_index: number, item: MatrixRequirementVm) {
    return item.id;
  }

  gapTrack(_index: number, item: GapVm) {
    return item.competency.id;
  }

  selectAdminPerson(id: string) {
    this.selectedAdminPersonId.set(id);
  }

  personTrack(_index: number, item: { id: string }) {
    return item.id;
  }
}
