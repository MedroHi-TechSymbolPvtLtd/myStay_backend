import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.example') }); // Fallback to example if .env missing, usually overridden by real env

export const config = {
    port: process.env.PORT || 3009,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    adminMasterKey: process.env.ADMIN_MASTER_KEY || 'master_key',
    services: {
        analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3008/api/analytics',
        expense: process.env.EXPENSE_SERVICE_URL || 'http://localhost:3004/api/expenses',
        transaction: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3005/api/transactions',
        notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006/api/notifications',
    }
};
