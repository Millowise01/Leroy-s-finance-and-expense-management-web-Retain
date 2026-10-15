import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
  isPaymentMethod,
} from '../services/expenseService.js';

const expenseSchema = z.object({
  title: z
    .string()
    .min(2)
    .max(100)
    .refine((v) => v.trim().length >= 2, { message: 'Title must contain at least 2 non-whitespace characters' }),
  description: z.string().max(500).optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'Amount must be a positive number with up to 2 decimal places' }),
  categoryId: z.string().min(1),
  paymentMethod: z.enum([
    'CASH',
    'MOBILE_MONEY',
    'DEBIT_CARD',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'OTHER',
  ]),
  expenseDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Invalid expense date' }).transform((v) => new Date(v)),
  notes: z.string().max(500).optional(),
});

function parseDateParam(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value === '') return undefined;
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return null as unknown as undefined; // signals invalid
  return new Date(ts);
}

export async function listExpensesController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const sortBy = req.query.sortBy === 'amount' ? 'amount' : 'date';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  // Validate date params
  const rawStart = req.query.startDate;
  const rawEnd = req.query.endDate;

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (typeof rawStart === 'string' && rawStart !== '') {
    const ts = Date.parse(rawStart);
    if (Number.isNaN(ts)) {
      res.status(400).json({ message: 'Invalid startDate parameter' });
      return;
    }
    startDate = new Date(ts);
  }

  if (typeof rawEnd === 'string' && rawEnd !== '') {
    const ts = Date.parse(rawEnd);
    if (Number.isNaN(ts)) {
      res.status(400).json({ message: 'Invalid endDate parameter' });
      return;
    }
    // Use start of the NEXT day so the full end date is included
    const d = new Date(ts);
    endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  }

  if (startDate && endDate && startDate >= endDate) {
    res.status(400).json({ message: 'startDate must be earlier than endDate' });
    return;
  }

  // Validate amount params
  let minAmount: number | undefined;
  let maxAmount: number | undefined;

  if (typeof req.query.minAmount === 'string' && req.query.minAmount !== '') {
    minAmount = Number(req.query.minAmount);
    if (!Number.isFinite(minAmount) || minAmount < 0) {
      res.status(400).json({ message: 'Invalid minAmount parameter' });
      return;
    }
  }

  if (typeof req.query.maxAmount === 'string' && req.query.maxAmount !== '') {
    maxAmount = Number(req.query.maxAmount);
    if (!Number.isFinite(maxAmount) || maxAmount < 0) {
      res.status(400).json({ message: 'Invalid maxAmount parameter' });
      return;
    }
  }

  if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
    res.status(400).json({ message: 'minAmount cannot exceed maxAmount' });
    return;
  }

  const result = await listExpenses({
    userId: req.user.userId,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    categoryId: typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined,
    paymentMethod:
      typeof req.query.paymentMethod === 'string' && isPaymentMethod(req.query.paymentMethod)
        ? req.query.paymentMethod
        : undefined,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  res.json(result);
}

export async function getExpenseController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const expenseId = req.params.id;

    if (typeof expenseId !== 'string') {
      res.status(400).json({ message: 'Invalid expense id' });
      return;
    }

    const expense = await getExpense(expenseId, req.user.userId);

    res.json({ expense });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : 'Expense not found',
    });
  }
}

export async function createExpenseController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const data = expenseSchema.parse(req.body);

    const expense = await createExpense({
      userId: req.user.userId,
      ...data,
    });

    res.status(201).json({ expense });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to create expense',
    });
  }
}

export async function updateExpenseController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const expenseId = req.params.id;

    if (typeof expenseId !== 'string') {
      res.status(400).json({ message: 'Invalid expense id' });
      return;
    }

    const data = expenseSchema.parse(req.body);

    const expense = await updateExpense(expenseId, req.user.userId, data);

    res.json({ expense });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to update expense',
    });
  }
}

export async function deleteExpenseController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const expenseId = req.params.id;

    if (typeof expenseId !== 'string') {
      res.status(400).json({ message: 'Invalid expense id' });
      return;
    }

    await deleteExpense(expenseId, req.user.userId);

    res.json({
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : 'Expense not found',
    });
  }
}
