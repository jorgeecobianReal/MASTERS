// Manejo centralizado de errores. Convierte cualquier excepción en una
// respuesta JSON homogénea: { error: { code, message, details? } }.
import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { formatZodError } from '../utils/validate';
import { logger } from '../utils/logger';
import { env } from '../config/env';

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

function mapError(err: unknown): { status: number; body: ErrorBody } {
  if (err instanceof AppError) {
    return { status: err.statusCode, body: { code: err.code, message: err.message, details: err.details } };
  }

  if (err instanceof ZodError) {
    return {
      status: 422,
      body: { code: 'VALIDATION_ERROR', message: 'Datos no válidos', details: formatZodError(err) },
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return { status: 404, body: { code: 'NOT_FOUND', message: 'Recurso no encontrado' } };
    }
    if (err.code === 'P2002') {
      return { status: 409, body: { code: 'CONFLICT', message: 'El recurso ya existe' } };
    }
    if (err.code === 'P2003') {
      return { status: 400, body: { code: 'BAD_REQUEST', message: 'Referencia inválida (clave foránea)' } };
    }
    return { status: 400, body: { code: 'DB_ERROR', message: 'Error de base de datos' } };
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      body: { code: 'DB_UNAVAILABLE', message: 'No se pudo conectar con la base de datos' },
    };
  }

  return { status: 500, body: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } };
}

// La firma con 4 argumentos es obligatoria para que Express lo trate como
// manejador de errores.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const { status, body } = mapError(err);

  if (status >= 500) {
    logger.error('Error no controlado', {
      message: err instanceof Error ? err.message : String(err),
      stack: env.isProduction ? undefined : err instanceof Error ? err.stack : undefined,
    });
  }

  res.status(status).json({ error: body });
}
