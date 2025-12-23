import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import propertyRoutes from './routes/properties.routes';
import dashboardRoutes from './routes/dashboard.routes';
import systemRoutes from './routes/system.routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));

// Routes
// Note: Prompt asked for GET /health under System Health.
// We can expose it globally here as well.
app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminRoutes); // /create, /list handled here
app.use('/api/admin/properties', propertyRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin', systemRoutes); // expenses, transactions, notify

// Error Handler
app.use(errorHandler);

export default app;
