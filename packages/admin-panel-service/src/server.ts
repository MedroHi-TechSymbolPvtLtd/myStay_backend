import app from './app';
import { config } from './config';
import logger from './logger';
import prisma from './prisma'; // Connect DB

const PORT = config.port;

const server = app.listen(PORT, () => {
    logger.info(`Admin Panel Service running on port ${PORT} in ${config.env} mode`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        prisma.$disconnect();
    });
});
