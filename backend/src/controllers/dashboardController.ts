import type { Request, Response } from "express";
import { getDashboard } from "../services/dashboardService";

export async function dashboardController(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required"
    });
    return;
  }

  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const dashboard = await getDashboard(
    req.user.userId,
    month,
    year
  );

  res.json({ dashboard });
}