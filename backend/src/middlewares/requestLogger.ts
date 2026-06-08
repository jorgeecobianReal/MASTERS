// Middleware de logging de peticiones HTTP (método, ruta, estado, duración).
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const meta = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    };
    if (res.statusCode >= 500) logger.error('HTTP', meta);
    else if (res.statusCode >= 400) logger.warn('HTTP', meta);
    else logger.info('HTTP', meta);
  });
  next();
}
