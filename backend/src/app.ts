// Construcción de la aplicación Express (sin arrancar el servidor).
// Separar app de server facilita los tests de integración.
import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { apiRouter } from './routes';
import { requestLogger } from './middlewares/requestLogger';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

export function createApp(): Application {
  const app = express();

  // Seguridad: cabeceras endurecidas.
  app.use(helmet());

  // CORS configurable por entorno.
  app.use(
    cors({
      origin: env.corsOrigins === '*' ? true : env.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  // Parseo de JSON con límite razonable.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging de peticiones.
  app.use(requestLogger);

  // Rate limiting básico sobre la API.
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Demasiadas peticiones, inténtalo más tarde.' } },
  });
  app.use('/api', limiter);

  // Raíz informativa.
  app.get('/', (_req, res) => {
    res.json({
      name: 'MasterMatch AI API',
      version: '1.0.0',
      docs: '/api/health',
      endpoints: [
        'POST /api/profile/analyze',
        'GET /api/masters',
        'GET /api/masters/:id',
        'POST /api/masters/compare',
        'POST /api/saved-masters',
        'GET /api/saved-masters?profileId=xxx',
      ],
    });
  });

  // Rutas de la API.
  app.use('/api', apiRouter);

  // 404 + manejador de errores (siempre al final).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
