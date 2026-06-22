import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MvpSliceDocument, type MvpSliceQuery } from '@comatrix/api-contracts';
import { print } from 'graphql';
import { map, retry, timer } from 'rxjs';

export type MvpDataVm = Omit<MvpSliceQuery, 'roleProfile' | 'matrix' | 'assessment' | 'developmentPlan'> & {
  roleProfile: NonNullable<MvpSliceQuery['roleProfile']>;
  matrix: NonNullable<MvpSliceQuery['matrix']>;
  assessment: NonNullable<MvpSliceQuery['assessment']>;
  developmentPlan: NonNullable<MvpSliceQuery['developmentPlan']>;
};

export type MatrixRequirementVm = MvpDataVm['matrix']['activeRevision']['requirements'][number];
export type ScoreVm = MvpDataVm['assessment']['scores'][number];
export type GapVm = MvpDataVm['assessment']['gaps'][number];

interface GraphQlResponse<T> {
  data: T;
  errors?: { message: string }[];
}

const MVP_QUERY = print(MvpSliceDocument);

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  loadMvpData() {
    return this.http
      .post<GraphQlResponse<MvpSliceQuery>>('/graphql', { query: MVP_QUERY })
      .pipe(
        retry({ count: 5, delay: (_error, retryCount) => timer(retryCount * 250) }),
        map((response) => {
          if (response.errors?.length) {
            throw new Error(response.errors.map((error) => error.message).join('\n'));
          }
          if (!response.data.roleProfile || !response.data.matrix || !response.data.assessment || !response.data.developmentPlan) {
            throw new Error('MVP GraphQL response is missing required slice data');
          }
          return response.data as MvpDataVm;
        }),
      );
  }
}
