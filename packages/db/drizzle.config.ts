import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { defaultConnectionString } from './src/client';

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.COMATRIX_DATABASE_URL ?? defaultConnectionString,
  },
});
