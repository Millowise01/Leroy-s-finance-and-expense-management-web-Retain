import { Router } from "express";
import {
  createExpenseController,
  deleteExpenseController,
  getExpenseController,
  listExpensesController,
  updateExpenseController
} from "../controllers/expenseController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", listExpensesController);
router.get("/:id", getExpenseController);
router.post("/", createExpenseController);
router.put("/:id", updateExpenseController);
router.delete("/:id", deleteExpenseController);

export default router;