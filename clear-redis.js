import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function clear() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  let cursor = '0';
  do {
    const res = await redis.scan(cursor, { match: 'student_dashboard_*', count: 1000 });
    cursor = res[0];
    const keys = res[1];
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Deleted ${keys.length} cached student dashboards.`);
    }
  } while (cursor !== '0');
  console.log("Cache cleared!");
}
clear();
