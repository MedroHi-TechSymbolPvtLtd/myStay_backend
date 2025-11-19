declare module 'redis' {
  export type RedisClientType = {
    connect(): Promise<void>;
    quit(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): void;
    get(key: string): Promise<string | null>;
    setEx(key: string, ttl: number, value: string): Promise<void>;
    del(key: string | string[]): Promise<void>;
    keys(pattern: string): Promise<string[]>;
  };

  export interface RedisClientOptions {
    url?: string;
  }

  export function createClient(options?: RedisClientOptions): RedisClientType;
}


