import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// Redis is essentially a key-value store, and we can think of it as a giant JSON object. It supports various data structures, such as hashes, sets, lists, and sorted sets. For this project, we will specifically be using strings or sets.

await redis.set('foo', 'bar');