import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import protectedRoutes from './routes/protected.routes';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'auth-service' });
  });

  app.get('/api/auth/test', (req: Request, res: Response) => {
    res.json({ message: 'Auth service is running' });
  });

  // Public auth routes (registration, login, forgot PIN)
  app.use('/api/auth', authRoutes);

  // Protected routes (require authentication)
  app.use('/api/auth', protectedRoutes);

  return app;
}

