// Validación Zod para endpoints de másteres, comparativa y guardados.
import { z } from 'zod';
import { modalitySchema } from './profile.schema';

/** UUID válido (Prisma genera UUID v4). */
export const idSchema = z.string().uuid('Identificador con formato no válido');

/** Filtros de GET /api/masters (todos opcionales, llegan como query string). */
export const masterFiltersSchema = z.object({
  country: z.string().trim().min(1).optional(),
  university: z.string().trim().min(1).optional(),
  area: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
  maxPrice: z.coerce.number().positive('maxPrice debe ser mayor que 0').optional(),
  modality: modalitySchema.optional(),
});

/** Param :id de rutas tipo GET /api/masters/:id. */
export const idParamSchema = z.object({
  id: idSchema,
});

/** Body de POST /api/masters/compare (máximo 3 másteres). */
export const compareSchema = z.object({
  masterIds: z
    .array(idSchema)
    .min(2, 'Indica al menos 2 másteres para comparar')
    .max(3, 'Solo se pueden comparar un máximo de 3 másteres')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'No repitas el mismo máster en la comparativa',
    }),
});

/** Body de POST /api/saved-masters. */
export const saveMasterSchema = z.object({
  profileId: idSchema,
  masterId: idSchema,
});

/** Query de GET /api/saved-masters?profileId=xxx. */
export const savedMastersQuerySchema = z.object({
  profileId: idSchema,
});

export type MasterFiltersSchema = z.infer<typeof masterFiltersSchema>;
export type CompareSchema = z.infer<typeof compareSchema>;
export type SaveMasterSchema = z.infer<typeof saveMasterSchema>;
