import { DecimalPipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService, GapVm, MatrixRequirementVm, ScoreVm } from './api.service';
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
    'Admin',
  ];

  requirementTrack(_index: number, item: MatrixRequirementVm) {
    return item.id;
  }

  gapTrack(_index: number, item: GapVm) {
    return item.competency.id;
  }
}
