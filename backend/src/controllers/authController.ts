import type { Request, Response } from 'express';
import { z } from 'zod';
import { getCurrentUser, signin, signup } from '../services/authService.js';

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function signupController(req: Request, res: Response): Promise<void> {
  try {
    const data = signupSchema.parse(req.body);
    const result = await signup(data.name, data.email, data.password);

    res.cookie('retain_token', result.token, cookieOptions);

    res.status(201).json({
      user: result.user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid request data' });
      return;
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to create account',
    });
  }
}

export async function signinController(req: Request, res: Response): Promise<void> {
  try {
    const data = signinSchema.parse(req.body);
    const result = await signin(data.email, data.password);

    res.cookie('retain_token', result.token, cookieOptions);

    res.json({
      user: result.user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid request data' });
      return;
    }
    res.status(401).json({
      message: 'Invalid email or password',
    });
  }
}

export async function signoutController(_req: Request, res: Response): Promise<void> {
  res.clearCookie('retain_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.json({
    message: 'Signed out successfully',
  });
}

export async function meController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      message: 'Authentication required',
    });
    return;
  }

  const user = await getCurrentUser(req.user.userId);

  if (!user) {
    res.status(404).json({
      message: 'User not found',
    });
    return;
  }

  res.json({ user });
}
