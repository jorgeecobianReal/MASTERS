import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';

export const profileRouter = Router();

// POST /api/profile/analyze
profileRouter.post('/analyze', profileController.analyze);
