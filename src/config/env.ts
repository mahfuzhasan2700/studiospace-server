import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().default('studiospace_db'),
  CLIENT_ORIGIN: z.string().default('http://localhost:3000'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET must be at least 16 chars').default('studiospace_super_secret_session_key_987654321'),
  CSRF_SECRET: z.string().min(16, 'CSRF_SECRET must be at least 16 chars').default('studiospace_csrf_secret_key_123456789'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  IMGBB_API_KEY: z.string().optional().default('')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = parsedEnv.data;

