import { Router } from 'express';
import { compareController } from '../controllers/compare.controller';

export const compareRouter = Router();

// POST /api/masters/compare
compareRouter.post('/compare', compareController.compare);
