import { Router } from "express";
import {
  getBudgetController,
  upsertBudgetController
} from "../controllers/budgetController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/:year/:month", getBudgetController);
router.post("/", upsertBudgetController);

export default router;