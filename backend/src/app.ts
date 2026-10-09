import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/healthRoutes.js';

export const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    credentials: true,
    origin: env.FRONTEND_ORIGIN,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use('/api', healthRouter);
app.use(notFoundHandler);
app.use(errorHandler);
