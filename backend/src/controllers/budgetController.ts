import type { Request, Response } from 'express';
import { z } from 'zod';
import { getBudget, upsertBudget } from '../services/budgetService.js';

const budgetSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: 'Amount must be a valid number with up to 2 decimal places',
    })
    .refine((v) => Number(v) > 0, { message: 'Budget amount must be greater than zero' }),
  month: z
    .number()
    .int()
    .min(1, { message: 'Month must be between 1 and 12' })
    .max(12, { message: 'Month must be between 1 and 12' }),
  year: z
    .number()
    .int()
    .min(2020, { message: 'Year must be between 2020 and 2100' })
    .max(2100, { message: 'Year must be between 2020 and 2100' }),
});

export async function getBudgetController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const month = Number(req.params.month);
  const year = Number(req.params.year);

  if (
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12 ||
    year < 2020 ||
    year > 2100
  ) {
    res.status(400).json({
      message: 'Invalid month or year',
    });
    return;
  }

  const result = await getBudget(req.user.userId, month, year);

  res.json(result);
}

export async function upsertBudgetController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const data = budgetSchema.parse({
      ...req.body,
      month: Number(req.body.month),
      year: Number(req.body.year),
    });

    const budget = await upsertBudget(req.user.userId, data.amount, data.month, data.year);

    res.json({ budget });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid budget data' });
      return;
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to save budget',
    });
  }
}
