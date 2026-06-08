// Carga y validación de variables de entorno con Zod.
// Si falta algo crítico (DATABASE_URL), el proceso falla rápido y claro.
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const booleanish = z
  .string()
  .optional()
  .transform((v) => v === undefined || v.toLowerCase() === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('*'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FORMAT: z.enum(['pretty', 'json']).default('pretty'),

  // Capa de IA (opcional)
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('gpt-4o-mini'),
  AI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  AI_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  AI_ENABLED: booleanish,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // No usamos el logger aquí para no acoplar el arranque a la config.
  // eslint-disable-next-line no-console
  console.error('❌ Variables de entorno inválidas:', parsed.error.flatten().fieldErrors);
  throw new Error('Configuración de entorno inválida. Revisa tu archivo .env');
}

const raw = parsed.data;

export const env = {
  ...raw,
  /** CORS_ORIGIN como array (o '*' tal cual). */
  corsOrigins: raw.CORS_ORIGIN === '*' ? '*' : raw.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean),
  /** La IA está activa solo si hay API key y AI_ENABLED no la desactiva. */
  aiEnabled: raw.AI_ENABLED && raw.AI_API_KEY.trim().length > 0,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
} as const;

export type Env = typeof env;
