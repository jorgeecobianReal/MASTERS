// Punto de entrada: arranca el servidor HTTP y gestiona el ciclo de vida.
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 MasterMatch AI API escuchando en http://localhost:${env.PORT}`, {
      env: env.NODE_ENV,
      aiEnabled: env.aiEnabled,
    });
  });

  // Apagado ordenado.
  const shutdown = async (signal: string) => {
    logger.info(`Recibida señal ${signal}, cerrando...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Si no cierra en 10s, forzar salida.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  logger.error('Fallo al arrancar el servidor', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
