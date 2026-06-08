// Controlador de másteres: listado con filtros, detalle y comparativa.
import type { Request, Response } from 'express';
import { mastersService } from '../services/masters.service';
import { idParamSchema, masterFiltersSchema } from '../schemas/master.schema';
import { asyncHandler } from '../utils/errors';
import { validate } from '../utils/validate';

export const mastersController = {
  // GET /api/masters
  list: asyncHandler(async (req: Request, res: Response) => {
    const filters = validate(masterFiltersSchema, req.query);
    const masters = await mastersService.listMasters(filters);
    // El frontend consume un array directo (no envoltorio).
    res.json(masters);
  }),

  // GET /api/masters/:id
  detail: asyncHandler(async (req: Request, res: Response) => {
    const { id } = validate(idParamSchema, req.params);
    const master = await mastersService.getMasterById(id);
    res.json(master);
  }),
};
