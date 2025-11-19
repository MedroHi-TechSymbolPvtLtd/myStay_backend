import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import profileRoutes from './routes/profile.routes';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'user-service' });
  });

  app.get('/api/users/test', (req: Request, res: Response) => {
    res.json({ message: 'User service is running' });
  });

  // Profile routes
  app.use('/api/users', profileRoutes);

  return app;
}

