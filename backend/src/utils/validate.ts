// Helper para validar con Zod y lanzar un ValidationError homogéneo.
import { z, ZodError } from 'zod';
import { ValidationError } from './errors';

/**
 * Valida `data` contra `schema`; si falla lanza ValidationError con detalles.
 * Devuelve el tipo de SALIDA del esquema (con defaults/transforms aplicados).
 */
export function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError('Los datos enviados no son válidos', formatZodError(result.error));
  }
  return result.data;
}

/** Aplana un ZodError a { campo: [mensajes] } legible para el cliente. */
export function formatZodError(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    (out[path] ??= []).push(issue.message);
  }
  return out;
}
