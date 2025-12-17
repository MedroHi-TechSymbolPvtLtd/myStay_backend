import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error.middleware';
import sendRoutes from './routes/send.routes';
import templatesRoutes from './routes/templates.routes';
import webhooksRoutes from './routes/webhooks.routes';
import metricsRoutes from './routes/metrics.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notify/send', sendRoutes);
app.use('/api/notify/templates', templatesRoutes);
app.use('/api/notify/webhook', webhooksRoutes);
app.use('/api/notify/metrics', metricsRoutes);
app.use('/health', metricsRoutes);

// Error Handler
app.use(errorHandler);

export default app;
