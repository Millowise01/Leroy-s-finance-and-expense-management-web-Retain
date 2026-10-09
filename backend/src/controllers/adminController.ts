import type { Request, Response } from 'express';
import { getAdminInsights } from '../services/adminService.js';

export async function adminInsightsController(_req: Request, res: Response): Promise<void> {
  const insights = await getAdminInsights();

  res.json({ insights });
}
