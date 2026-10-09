import { Router } from 'express';
import {
  createCategoryController,
  deleteCategoryController,
  listCategories,
  updateCategoryController,
} from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

router.get('/', requireAuth, listCategories);

router.post('/', requireAuth, requireAdmin, createCategoryController);

router.put('/:id', requireAuth, requireAdmin, updateCategoryController);

router.delete('/:id', requireAuth, requireAdmin, deleteCategoryController);

export default router;
