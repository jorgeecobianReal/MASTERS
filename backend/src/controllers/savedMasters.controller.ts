// Controlador de másteres guardados (favoritos).
import type { Request, Response } from 'express';
import { savedMastersService } from '../services/savedMasters.service';
import { saveMasterSchema, savedMastersQuerySchema } from '../schemas/master.schema';
import { asyncHandler } from '../utils/errors';
import { validate } from '../utils/validate';

export const savedMastersController = {
  // POST /api/saved-masters
  save: asyncHandler(async (req: Request, res: Response) => {
    const { profileId, masterId } = validate(saveMasterSchema, req.body);
    const saved = await savedMastersService.save(profileId, masterId);
    res.status(201).json(saved);
  }),

  // GET /api/saved-masters?profileId=xxx
  list: asyncHandler(async (req: Request, res: Response) => {
    const { profileId } = validate(savedMastersQuerySchema, req.query);
    const saved = await savedMastersService.listByProfile(profileId);
    // El frontend consume un array directo (no envoltorio).
    res.json(saved);
  }),
};
