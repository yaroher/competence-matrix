# Competence Matrix

Clean development scaffold for a new product implementation.

## What Is Kept

- Yarn workspaces and Turborepo task orchestration.
- TypeScript base config.
- GraphQL Yoga API with `/graphql`, `/healthz`, and `/readyz`.
- React application shell on Vite with proxying to the API.
- Tailwind CSS v4 and PostCSS setup.
- GraphQL Code Generator setup.
- Drizzle/PostgreSQL package, config, migration directory, and seed command.
- Docker Compose local stack.
- GitHub Actions CI.
- Playwright smoke-test wiring.

## Local Run

```bash
yarn install
yarn build
yarn dev
```

The web app runs on `http://localhost:4200` and proxies `/graphql` to the API on `http://localhost:4000/graphql`.

## Database Tooling

The database schema is intentionally empty until the new product model is defined.

```bash
docker compose up -d postgres
yarn db:generate
yarn db:migrate
yarn db:seed
```

The local default database URL is `postgres://comatrix:comatrix@localhost:5432/comatrix`.

## GraphQL Codegen

GraphQL schema and operations live in `packages/api-contracts/src`.

```bash
yarn codegen
```

Generated TypeScript operation types and `TypedDocumentNode` artifacts are emitted to `packages/api-contracts/src/generated/graphql.ts`.

## Checks

```bash
yarn codegen:check
yarn typecheck
yarn test
yarn e2e
yarn build
```
