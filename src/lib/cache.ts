interface CacheEntry<T> {
  data: T;
  expireAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expireAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expireAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

// 全局单例，Serverless 环境下同一实例内复用
export const cache = new MemoryCache();
