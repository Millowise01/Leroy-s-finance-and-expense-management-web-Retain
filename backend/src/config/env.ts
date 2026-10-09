import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  SEED_DEMO_DATA: z.enum(['true', 'false']).default('false'),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  throw new Error('Invalid backend environment configuration');
}

export const env = parsedEnvironment.data;
