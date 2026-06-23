import { HttpInterceptorFn } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { MvpSliceDocument, OrganizationGapSummaryDocument, PeopleAssignmentsDocument, type MvpSliceQuery, type OrganizationGapSummaryQuery, type PeopleAssignmentsQuery } from '@comatrix/api-contracts';
import { print } from 'graphql';
import { BehaviorSubject, catchError, filter, map, retry, switchMap, timer } from 'rxjs';

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
  { id: 'user-alexey', label: 'Alexey Morozov · employee' },
  { id: 'user-marina', label: 'Marina Volkova · manager' },
  { id: 'user-daria', label: 'Daria People · hr' },
  { id: 'user-igor', label: 'Igor Sokolov · expert' },
  { id: 'user-elena', label: 'Elena Method · methodology_admin' },
] as const;

export const activeUserId = signal<string>('user-alexey');

export const actorInterceptor: HttpInterceptorFn = (req, next) => {
  const authed = req.clone({ setHeaders: { 'x-comatrix-user-id': activeUserId() } });
  return next(authed);
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly peopleData$ = this.refresh$.pipe(switchMap(() => this.loadPeopleAssignments()));
  readonly gapSummary$ = this.refresh$.pipe(
    switchMap(() =>
      this.http
        .post<GraphQlResponse<OrganizationGapSummaryQuery>>('/graphql', { query: print(OrganizationGapSummaryDocument) })
        .pipe(
          map((r) => (r.errors?.length ? null : r.data.organizationGapSummary)),
          catchError(() => [null as OrganizationGapSummaryVm]),
        ),
    ),
  );

  setActiveUser(id: string) {
    activeUserId.set(id);
  }

  refresh() {
    this.refresh$.next();
  }

  loadMvpData() {
    return this.http.post<GraphQlResponse<MvpSliceQuery>>('/graphql', { query: MVP_QUERY }).pipe(
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

  query<T, V>(document: TypedDocumentNode<T, V>, variables?: V) {
    return this.http
      .post<GraphQlResponse<T>>('/graphql', { query: print(document), variables })
      .pipe(
        retry({ count: 2, delay: (_e, n) => timer(n * 250) }),
        map((r) => {
          if (r.errors?.length) throw new Error(r.errors.map((e) => e.message).join('\n'));
          return r.data;
        }),
      );
  }

  mutate<T, V>(document: TypedDocumentNode<T, V>, variables?: V) {
    return this.query<T, V>(document, variables).pipe(
      map((data) => {
        this.refresh();
        return data;
      }),
    );
  }
}

export { filter };
