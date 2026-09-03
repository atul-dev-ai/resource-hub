import { Redis } from '@upstash/redis';
async function clear() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  await redis.del('global_class_routines');
  await redis.del('admin_routine_data');
  console.log("Global Routine Cache cleared!");
}
clear();
