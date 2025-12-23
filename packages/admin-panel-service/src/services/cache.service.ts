import Redis from 'ioredis';
import { config } from '../config';
import logger from '../logger';

class CacheService {
    private redis: Redis;

    constructor() {
        this.redis = new Redis(config.redisUrl);

        this.redis.on('error', (err) => {
            logger.error('Redis error', err);
        });

        this.redis.on('connect', () => {
            logger.info('Connected to Redis');
        });
    }

    async get(key: string): Promise<any | null> {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async set(key: string, value: any, ttlSeconds: number): Promise<void> {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    }

    async delete(key: string): Promise<void> {
        await this.redis.del(key);
    }
}

export const cacheService = new CacheService();
