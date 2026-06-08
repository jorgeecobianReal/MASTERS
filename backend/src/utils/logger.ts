// Logger ligero y sin dependencias, con niveles y formato pretty/json.
// Suficiente para "logs básicos" y apto para producción (salida estructurada).

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const COLORS: Record<Level, string> = {
  debug: '\x1b[90m', // gris
  info: '\x1b[36m', // cian
  warn: '\x1b[33m', // amarillo
  error: '\x1b[31m', // rojo
};
const RESET = '\x1b[0m';

function resolveLevel(): Level {
  const raw = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
  return (['debug', 'info', 'warn', 'error'] as Level[]).includes(raw as Level) ? (raw as Level) : 'info';
}

function isJson(): boolean {
  return (process.env.LOG_FORMAT ?? 'pretty').toLowerCase() === 'json';
}

function emit(level: Level, message: string, meta?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[resolveLevel()]) return;
  const timestamp = new Date().toISOString();

  if (isJson()) {
    const line = JSON.stringify({ timestamp, level, message, ...(meta ?? {}) });
    process.stdout.write(line + '\n');
    return;
  }

  const color = COLORS[level];
  const tag = `${color}${level.toUpperCase().padEnd(5)}${RESET}`;
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  process.stdout.write(`${timestamp} ${tag} ${message}${metaStr}\n`);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
};

export type Logger = typeof logger;
