// Controlador de perfil. Valida el payload y delega en el servicio.
import type { Request, Response } from 'express';
import { recommendationService } from '../services/recommendation.service';
import { userProfileInputSchema } from '../schemas/profile.schema';
import { asyncHandler } from '../utils/errors';
import { validate } from '../utils/validate';

export const profileController = {
  // POST /api/profile/analyze
  analyze: asyncHandler(async (req: Request, res: Response) => {
    const input = validate(userProfileInputSchema, req.body);
    const result = await recommendationService.analyzeProfile(input);
    res.status(201).json(result);
  }),
};
