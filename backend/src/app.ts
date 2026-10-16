import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    application: 'Retain',
  });
});

app.get('/api/setup-admin', async (req, res) => {
  if (req.query.token !== process.env.SETUP_TOKEN) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  try {
    const { prisma } = await import('./config/prisma.js');
    const { hashPassword } = await import('./utils/password.js');
    const user = await prisma.user.upsert({
      where: { email: 'admin@retain.local' },
      update: { role: 'ADMIN', password: await hashPassword('Admin@12345') },
      create: {
        name: 'Retain Administrator',
        email: 'admin@retain.local',
        password: await hashPassword('Admin@12345'),
        role: 'ADMIN',
      },
      select: { email: true, role: true },
    });
    res.json({ message: 'Admin created', user });
  } catch (error) {
    res.status(500).json({ message: String(error) });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
