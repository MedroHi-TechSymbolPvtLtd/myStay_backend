import { PrismaClient } from '@prisma/client';
import logger from './logger';

export const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

async function connectDB() {
    try {
        await prisma.$connect();
        logger.info('Connected to PostgreSQL via Prisma');
    } catch (err) {
        logger.error('Database connection failed', err);
        process.exit(1);
    }
}

connectDB();
