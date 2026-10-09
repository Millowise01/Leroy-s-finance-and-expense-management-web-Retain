import type { Request, Response } from "express";
import { z } from "zod";
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense
} from "../services/expenseService";

const expenseSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  categoryId: z.string().min(1),
  paymentMethod: z.enum([
    "CASH",
    "MOBILE_MONEY",
    "DEBIT_CARD",
    "CREDIT_CARD",
    "BANK_TRANSFER",
    "OTHER"
  ]),
  expenseDate: z.coerce.date(),
  notes: z.string().max(500).optional()
});

export async function listExpensesController(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    100
  );

  const sortBy =
    req.query.sortBy === "amount" ? "amount" : "date";

  const sortOrder =
    req.query.sortOrder === "asc" ? "asc" : "desc";

  const result = await listExpenses({
    userId: req.user.userId,
    search:
      typeof req.query.search === "string"
        ? req.query.search
        : undefined,
    categoryId:
      typeof req.query.categoryId === "string"
        ? req.query.categoryId
        : undefined,
    paymentMethod:
      typeof req.query.paymentMethod === "string"
        ? req.query.paymentMethod
        : undefined,
    startDate:
      typeof req.query.startDate === "string"
        ? new Date(req.query.startDate)
        : undefined,
    endDate:
      typeof req.query.endDate === "string"
        ? new Date(req.query.endDate)
        : undefined,
    minAmount:
      typeof req.query.minAmount === "string"
        ? Number(req.query.minAmount)
        : undefined,
    maxAmount:
      typeof req.query.maxAmount === "string"
        ? Number(req.query.maxAmount)
        : undefined,
    sortBy,
    sortOrder,
    page,
    limit
  });

  res.json(result);
}

export async function getExpenseController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const expense = await getExpense(
      req.params.id,
      req.user.userId
    );

    res.json({ expense });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error
        ? error.message
        : "Expense not found"
    });
  }
}

export async function createExpenseController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const data = expenseSchema.parse(req.body);

    const expense = await createExpense({
      userId: req.user.userId,
      ...data
    });

    res.status(201).json({ expense });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error
        ? error.message
        : "Unable to create expense"
    });
  }
}

export async function updateExpenseController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const data = expenseSchema.parse(req.body);

    const expense = await updateExpense(
      req.params.id,
      req.user.userId,
      data
    );

    res.json({ expense });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error
        ? error.message
        : "Unable to update expense"
    });
  }
}

export async function deleteExpenseController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    await deleteExpense(
      req.params.id,
      req.user.userId
    );

    res.json({
      message: "Expense deleted successfully"
    });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error
        ? error.message
        : "Expense not found"
    });
  }
}