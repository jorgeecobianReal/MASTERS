// Cliente Prisma como singleton (evita múltiples conexiones en dev/hot-reload).
import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/** Comprueba la conexión a la base de datos. */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('Conexión a la base de datos establecida');
}

/** Cierra la conexión de forma ordenada. */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Conexión a la base de datos cerrada');
}
