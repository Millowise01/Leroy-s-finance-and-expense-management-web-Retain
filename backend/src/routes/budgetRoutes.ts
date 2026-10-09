import { Router } from 'express';
import { getBudgetController, upsertBudgetController } from '../controllers/budgetController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/:year/:month', getBudgetController);
router.post('/', upsertBudgetController);

export default router;
