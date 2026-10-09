import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, dashboardController);

export default router;
