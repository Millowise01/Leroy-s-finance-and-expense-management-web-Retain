import type { NextFunction, Request, Response } from 'express';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    message: 'Route not found',
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  void next;
  console.error(error);

  if (error instanceof Error) {
    res.status(500).json({
      message: error.message || 'Internal server error',
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error',
  });
}
