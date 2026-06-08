import { Router } from 'express';
import { mastersController } from '../controllers/masters.controller';

export const mastersRouter = Router();

// GET /api/masters           (filtros opcionales por query)
mastersRouter.get('/', mastersController.list);

// GET /api/masters/:id
mastersRouter.get('/:id', mastersController.detail);
