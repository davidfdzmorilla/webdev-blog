import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect lazily
let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
  return redisClient;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number = 300) {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Redis SET error:', error);
  }
}

export async function cacheDelete(key: string) {
  try {
    const client = await getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Redis DELETE error:', error);
  }
}

export async function cacheDeletePattern(pattern: string) {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Redis DELETE PATTERN error:', error);
  }
}
