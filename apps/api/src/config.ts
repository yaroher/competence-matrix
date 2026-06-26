import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  COMATRIX_API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
});

export const config = schema.parse(process.env);
