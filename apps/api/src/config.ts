import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  COMATRIX_API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  COMATRIX_DATA_SOURCE: z.enum(['seed', 'postgres']).default('seed'),
  COMATRIX_DATABASE_URL: z.string().default('postgres://comatrix:comatrix@localhost:5432/comatrix'),
});

export const config = schema.parse(process.env);
