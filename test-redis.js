require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
async function run() {
  const data = await redis.get('approved_resources');
  console.log("Type of data:", typeof data);
  console.log("Is array?", Array.isArray(data));
  console.log("Data sample:", Array.isArray(data) ? data.slice(0, 1) : data);
}
run();
