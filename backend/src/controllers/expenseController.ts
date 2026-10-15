import type { Request, Response } from 'express';
import { z } from 'zod';
import type { PaymentMethod } from '../../generated/prisma/client.js';
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
    .refine((v) => v.trim().length >= 2, {
      message: 'Title must contain at least 2 non-whitespace characters',
    }),
  description: z.string().max(500).optional(),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: 'Amount must be a positive number with up to 2 decimal places',
    })
    .refine((v) => Number(v) > 0, { message: 'Amount must be greater than zero' }),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  paymentMethod: z.enum(
    ['CASH', 'MOBILE_MONEY', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER'],
    { message: 'Invalid payment method' },
  ),
  expenseDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Invalid expense date' })
    .transform((v) => new Date(v)),
  notes: z.string().max(500, { message: 'Notes must not exceed 500 characters' }).optional(),
});

export async function listExpensesController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  // Validate pagination
  let page = 1;
  if (req.query.page !== undefined && req.query.page !== '') {
    const parsedPage = Number(req.query.page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      res.status(400).json({ message: 'page must be a positive integer' });
      return;
    }
    page = parsedPage;
  }

  let limit = 10;
  if (req.query.limit !== undefined && req.query.limit !== '') {
    const parsedLimit = Number(req.query.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      res.status(400).json({ message: 'limit must be an integer between 1 and 100' });
      return;
    }
    limit = parsedLimit;
  }

  // Validate sortBy and sortOrder
  let sortBy: 'date' | 'amount' = 'date';
  if (req.query.sortBy !== undefined && req.query.sortBy !== '') {
    if (req.query.sortBy !== 'date' && req.query.sortBy !== 'amount') {
      res.status(400).json({ message: 'sortBy must be either "date" or "amount"' });
      return;
    }
    sortBy = req.query.sortBy;
  }

  let sortOrder: 'asc' | 'desc' = 'desc';
  if (req.query.sortOrder !== undefined && req.query.sortOrder !== '') {
    if (req.query.sortOrder !== 'asc' && req.query.sortOrder !== 'desc') {
      res.status(400).json({ message: 'sortOrder must be either "asc" or "desc"' });
      return;
    }
    sortOrder = req.query.sortOrder;
  }

  // Validate paymentMethod
  let paymentMethod: string | undefined;
  if (typeof req.query.paymentMethod === 'string' && req.query.paymentMethod !== '') {
    if (!isPaymentMethod(req.query.paymentMethod)) {
      res.status(400).json({ message: 'Invalid paymentMethod parameter' });
      return;
    }
    paymentMethod = req.query.paymentMethod;
  }

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

  if (rawStart && rawEnd && typeof rawStart === 'string' && typeof rawEnd === 'string') {
    const parsedRawStart = new Date(Date.parse(rawStart));
    const parsedRawEnd = new Date(Date.parse(rawEnd));
    if (parsedRawStart > parsedRawEnd) {
      res.status(400).json({ message: 'startDate cannot be later than endDate' });
      return;
    }
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
    paymentMethod: paymentMethod as PaymentMethod | undefined,
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
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid expense data' });
      return;
    }
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
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid expense data' });
      return;
    }
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
