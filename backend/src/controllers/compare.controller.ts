// Controlador de comparativa de másteres (POST /api/masters/compare).
import type { Request, Response } from 'express';
import { mastersService } from '../services/masters.service';
import { compareSchema } from '../schemas/master.schema';
import { asyncHandler } from '../utils/errors';
import { validate } from '../utils/validate';

export const compareController = {
  // POST /api/masters/compare
  compare: asyncHandler(async (req: Request, res: Response) => {
    const { masterIds } = validate(compareSchema, req.body);
    const comparison = await mastersService.compareMasters(masterIds);
    res.json(comparison);
  }),
};
