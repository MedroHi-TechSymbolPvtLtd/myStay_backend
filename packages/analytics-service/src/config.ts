import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
    port: process.env.PORT || 3008,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    cacheEnabled: process.env.CACHE_ENABLE === 'true',
};
