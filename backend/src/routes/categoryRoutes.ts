import { Router } from "express";
import {
  createCategoryController,
  deleteCategoryController,
  listCategories,
  updateCategoryController
} from "../controllers/categoryController";
import { requireAuth } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";

const router = Router();

router.get("/", requireAuth, listCategories);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  createCategoryController
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  updateCategoryController
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteCategoryController
);

export default router;