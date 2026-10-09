import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, dashboardController);

export default router;