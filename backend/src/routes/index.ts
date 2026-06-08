// Router raíz: monta todos los sub-routers bajo /api.
import { Router } from 'express';
import { profileRouter } from './profile.routes';
import { mastersRouter } from './masters.routes';
import { compareRouter } from './compare.routes';
import { savedMastersRouter } from './savedMasters.routes';
import { mastersRepository } from '../repositories/masters.repository';
import { isAIEnabled } from '../services/ai.service';
import { asyncHandler } from '../utils/errors';

export const apiRouter = Router();

// Healthcheck con estado de catálogo e IA.
apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const mastersCount = await mastersRepository.count();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mastersCount,
      aiEnabled: isAIEnabled(),
    });
  }),
);

apiRouter.use('/profile', profileRouter);
// El orden importa: /masters/compare debe resolverse antes que /masters/:id.
apiRouter.use('/masters', compareRouter);
apiRouter.use('/masters', mastersRouter);
apiRouter.use('/saved-masters', savedMastersRouter);
