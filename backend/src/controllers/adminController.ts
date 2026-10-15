import type { Request, Response } from 'express';
import { z } from 'zod';
import { createAdminUser, getAdminInsights } from '../services/adminService.js';

const createUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must not exceed 100 characters' })
    .refine((v) => v.trim().length >= 2, {
      message: 'Name must contain at least 2 non-whitespace characters',
    }),
  email: z.string().email({ message: 'Please provide a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password must not exceed 100 characters' }),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

export async function adminInsightsController(_req: Request, res: Response): Promise<void> {
  const insights = await getAdminInsights();

  res.json({ insights });
}

export async function createUserController(req: Request, res: Response): Promise<void> {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await createAdminUser(data);

    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid request data' });
      return;
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to create user',
    });
  }
}
