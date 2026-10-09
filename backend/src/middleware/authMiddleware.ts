import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.retain_token;

  if (!token) {
    res.status(401).json({
      message: 'Authentication required',
    });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({
      message: 'Invalid or expired authentication token',
    });
  }
}
