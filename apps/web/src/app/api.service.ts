import { HttpInterceptorFn } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { OrganizationGapSummaryDocument, MvpSliceDocument, PeopleAssignmentsDocument, type MvpSliceQuery, type OrganizationGapSummaryQuery, type PeopleAssignmentsQuery } from '@comatrix/api-contracts';
import { print } from 'graphql';
import { catchError, map, of, retry, timer } from 'rxjs';

export type MvpDataVm = Omit<MvpSliceQuery, 'roleProfile' | 'matrix' | 'assessment' | 'developmentPlan'> & {
  roleProfile: NonNullable<MvpSliceQuery['roleProfile']>;
  matrix: NonNullable<MvpSliceQuery['matrix']>;
  assessment: NonNullable<MvpSliceQuery['assessment']>;
  developmentPlan: NonNullable<MvpSliceQuery['developmentPlan']>;
};

export type MatrixRequirementVm = MvpDataVm['matrix']['activeRevision']['requirements'][number];
export type ScoreVm = MvpDataVm['assessment']['scores'][number];
export type GapVm = MvpDataVm['assessment']['gaps'][number];

export type PeopleAssignmentsVm = PeopleAssignmentsQuery;
export type OrganizationGapSummaryVm = OrganizationGapSummaryQuery['organizationGapSummary'] | null;

interface GraphQlResponse<T> {
  data: T;
  errors?: { message: string }[];
}

const MVP_QUERY = print(MvpSliceDocument);
const PEOPLE_ASSIGNMENTS_QUERY = print(PeopleAssignmentsDocument);

export const DEV_PERSONAS = [
  { id: 'user-alexey', label: 'Alexey · employee' },
  { id: 'user-marina', label: 'Marina · manager' },
  { id: 'user-daria', label: 'Daria · hr' },
  { id: 'user-igor', label: 'Igor · expert' },
  { id: 'user-elena', label: 'Elena · methodology_admin' },
] as const;

export const activeUserId = signal<string>('user-alexey');

export const actorInterceptor: HttpInterceptorFn = (req, next) => {
  const authed = req.clone({ setHeaders: { 'x-comatrix-user-id': activeUserId() } });
  return next(authed);
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  setActiveUser(id: string) {
    activeUserId.set(id);
  }

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

  loadPeopleAssignments() {
    return this.http.post<GraphQlResponse<PeopleAssignmentsQuery>>('/graphql', { query: PEOPLE_ASSIGNMENTS_QUERY }).pipe(
      retry({ count: 5, delay: (_error, retryCount) => timer(retryCount * 250) }),
      map((response) => {
        if (response.errors?.length) {
          throw new Error(response.errors.map((error) => error.message).join('\n'));
        }
        return response.data;
      }),
    );
  }

  loadOrganizationGapSummary() {
    return this.http.post<GraphQlResponse<OrganizationGapSummaryQuery>>('/graphql', { query: print(OrganizationGapSummaryDocument) }).pipe(
      map((response) => {
        if (response.errors?.length) {
          throw new Error(response.errors.map((error) => error.message).join('\n'));
        }
        return response.data.organizationGapSummary;
      }),
      catchError(() => of(null)),
    );
  }
}
