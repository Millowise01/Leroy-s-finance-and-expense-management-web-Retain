import { Router } from "express";
import { adminInsightsController } from "../controllers/adminController";
import { requireAuth } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/insights", adminInsightsController);

export default router;