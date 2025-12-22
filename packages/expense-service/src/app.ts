import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes will be added here
// app.use('/api/expenses', ...);

export default app;
