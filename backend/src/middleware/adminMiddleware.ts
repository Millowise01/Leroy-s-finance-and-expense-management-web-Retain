import type { NextFunction, Request, Response } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      message: "Authentication required"
    });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({
      message: "Administrator access required"
    });
    return;
  }

  next();
}