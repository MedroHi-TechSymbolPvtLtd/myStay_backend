import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes';
import analyticsRoutes from './routes/analytics.routes';
// import propertyRoutes from './routes/property.routes'; // Will add later
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));

// Routes
app.use('/health', healthRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handler
app.use(errorHandler);

export default app;
