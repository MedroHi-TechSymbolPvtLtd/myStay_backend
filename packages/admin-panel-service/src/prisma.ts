import { PrismaClient } from './generated/client';
import logger from './logger';

const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

async function connectDB() {
    try {
        await prisma.$connect();
        logger.info('Connected to PostgreSQL via Prisma');
    } catch (error) {
        logger.error('Database connection failed', error);
    }
}

connectDB();

export default prisma;
