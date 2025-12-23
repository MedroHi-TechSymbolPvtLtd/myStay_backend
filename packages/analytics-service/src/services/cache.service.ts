import Redis from 'ioredis';
import { config } from '../config';
import logger from '../logger';

const redis = new Redis(config.redisUrl);

export const cacheService = {
    async get(key: string): Promise<any | null> {
        if (!config.cacheEnabled) return null;
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            logger.error('Redis Get Error', err);
            return null;
        }
    },

    async set(key: string, data: any, ttlSeconds: number): Promise<void> {
        if (!config.cacheEnabled) return;
        try {
            await redis.setex(key, ttlSeconds, JSON.stringify(data));
        } catch (err) {
            logger.error('Redis Set Error', err);
        }
    },

    async del(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (err) {
            logger.error('Redis Del Error', err);
        }
    },
};
