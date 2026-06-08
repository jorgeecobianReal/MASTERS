import { Router } from 'express';
import { savedMastersController } from '../controllers/savedMasters.controller';

export const savedMastersRouter = Router();

// POST /api/saved-masters
savedMastersRouter.post('/', savedMastersController.save);

// GET /api/saved-masters?profileId=xxx
savedMastersRouter.get('/', savedMastersController.list);
