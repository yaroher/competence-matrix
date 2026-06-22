import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export const defaultConnectionString = 'postgres://comatrix:comatrix@localhost:5432/comatrix';

export function createPool(connectionString = process.env.COMATRIX_DATABASE_URL ?? defaultConnectionString) {
  if (!connectionString) {
    throw new Error('COMATRIX_DATABASE_URL is required');
  }

  return new Pool({ connectionString });
}

export function createDb(pool = createPool()) {
  return drizzle(pool, { schema });
}

export type ComatrixDb = ReturnType<typeof createDb>;
