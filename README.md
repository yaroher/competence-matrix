# Competence Matrix

Corporate competency-matrix platform MVP.

## Current Slice

The first runnable slice covers:

- Yarn workspaces + Turborepo.
- GraphQL Yoga API.
- Angular web app.
- Extensible IT ontology seed.
- `Backend Go Engineer / Senior` role profile.
- Matrix, assessment, gap, and development-plan read path.
- GraphQL Code Generator artifacts from `.graphql` schema and operations.
- Drizzle schema, generated SQL migrations, local PostgreSQL seed and optional API PostgreSQL data source.
- Zard UI components on Tailwind CSS v4.
- Playwright browser smoke test.

## Local Run

```bash
yarn install
yarn build
yarn dev
```

The web app runs on `http://localhost:4200` and proxies `/graphql` to the API on `http://localhost:4000/graphql`.

By default the API uses the in-memory MVP seed so the app can run without Docker:

```bash
COMATRIX_DATA_SOURCE=seed yarn dev
```

For the PostgreSQL path:

```bash
docker compose up -d postgres
yarn db:migrate
yarn db:seed
COMATRIX_DATA_SOURCE=postgres yarn workspace @comatrix/api dev
```

The local default database URL is `postgres://comatrix:comatrix@localhost:5432/comatrix`.

## Codegen

GraphQL schema and operations live in `packages/api-contracts/src`.

```bash
yarn codegen
```

Generated TypeScript operation types and `TypedDocumentNode` artifacts are emitted to `packages/api-contracts/src/generated/graphql.ts` and consumed by the Angular app.

## Smoke Check

```bash
curl -fsS http://localhost:4000/graphql \
  -H "content-type: application/json" \
  --data '{"query":"query { dashboard { activeCycleName competencies criticalGaps } roleProfile(id: \"profile-backend-go-senior\") { name grade { name } } }"}'
```

```bash
yarn typecheck
yarn test
yarn e2e
```

## Zard UI

The app uses Zard CLI generated Angular components:

- `button`
- `badge`
- `card`
- `table`

Configuration lives in `apps/web/components.json`. Tailwind CSS v4 is imported from `apps/web/src/styles.css`, with theme tokens for the generated Zard classes.
