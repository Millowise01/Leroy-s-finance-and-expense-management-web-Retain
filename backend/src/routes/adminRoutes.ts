import { Router } from 'express';
import { adminInsightsController } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/insights', adminInsightsController);

export default router;
