/* eslint-disable @typescript-eslint/no-var-requires */
import type { RedisClientType } from 'redis';

type CreateClientFn = (options?: { url?: string }) => RedisClientType;

let createClientFn: CreateClientFn | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const redisModule = require('redis') as typeof import('redis');
  createClientFn = redisModule.createClient;
} catch (error) {
  console.warn('[Cache Service] `redis` package not found. Falling back to in-memory cache.');
}

type MemoryEntry = {
  value: string;
  expiresAt: number;
};

/**
 * Redis Cache Service
 * 
 * Wrapper around Redis client with get/set/del operations
 */
export class CacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private readonly useMemoryCache: boolean = !createClientFn;
  private memoryStore: Map<string, MemoryEntry> = new Map();

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.useMemoryCache) {
      console.warn('[Cache Service] Using in-memory cache (Redis not available).');
      return;
    }

    if (this.isConnected && this.client) {
      return;
    }

    if (!createClientFn) {
      console.warn('[Cache Service] Redis client factory not available. Falling back to in-memory cache.');
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = createClientFn({
        url: redisUrl,
      });

      this.client.on('error', (err: Error) => {
        console.error('[Cache Service] Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('[Cache Service] Redis Client Connected');
        this.isConnected = true;
      });

      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      console.error('[Cache Service] Failed to connect to Redis:', error);
      console.warn('[Cache Service] Continuing without cache (cache operations will be no-ops)');
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    if (this.useMemoryCache) {
      return this.getFromMemory(key);
    }

    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error(`[Cache Service] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (time to live) in seconds
   */
  async set(key: string, value: string, ttlSeconds: number = 300): Promise<boolean> {
    if (this.useMemoryCache) {
      this.setInMemory(key, value, ttlSeconds);
      return true;
    }

    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, value);
      return true;
    } catch (error) {
      console.error(`[Cache Service] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    if (this.useMemoryCache) {
      return this.deleteFromMemory(key);
    }

    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`[Cache Service] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<boolean> {
    if (this.useMemoryCache) {
      for (const key of Array.from(this.memoryStore.keys())) {
        if (this.patternMatches(key, pattern)) {
          this.memoryStore.delete(key);
        }
      }
      return true;
    }

    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error(`[Cache Service] Error deleting pattern ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.useMemoryCache ? true : this.isConnected;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.useMemoryCache) {
      this.memoryStore.clear();
      return;
    }

    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  // -----------------------
  // In-memory cache helpers
  // -----------------------

  private getFromMemory(key: string): string | null {
    const entry = this.memoryStore.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value;
  }

  private setInMemory(key: string, value: string, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryStore.set(key, { value, expiresAt });
  }

  private deleteFromMemory(key: string): boolean {
    return this.memoryStore.delete(key);
  }

  private patternMatches(key: string, pattern: string): boolean {
    if (pattern === '*') {
      return true;
    }

    const regexPattern = new RegExp(
      '^' +
        pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.') +
        '$'
    );

    return regexPattern.test(key);
  }
}

export const cacheService = new CacheService();

// Initialize connection on module load
cacheService.connect().catch(console.error);

