"use server";

import { createClient } from "@/utils/supabase/server";
import { Redis } from "@upstash/redis";

const CACHE_KEY = "approved_resources";
const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

export async function getApprovedResources() {
  let cachedResources = null;
  let redis = null;
  
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      // 1. Try fetching from Redis cache
      cachedResources = await redis.get(CACHE_KEY);
    } else {
      console.warn("Redis credentials missing, bypassing cache");
    }
  } catch (error) {
    console.error("Redis Cache Error:", error);
    // Continue to fetch from Supabase if Redis fails
  }
  
  if (cachedResources) {
    console.log("Redis Cache Hit for resources");
    return cachedResources as any[];
  }

  console.log("Redis Cache Miss/Error for resources, fetching from DB");

  try {
    // 2. Fetch from Supabase
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("resources")
      .select(`*, profiles(full_name)`)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Error fetching resources:", error);
      throw new Error("Failed to fetch resources");
    }

    console.log("Fetched from DB:", data?.length, "items.");

    // 3. Save to Redis cache
    if (data && redis) {
      try {
        await redis.set(CACHE_KEY, data, { ex: CACHE_TTL });
      } catch(e) {}
    }

    return data || [];
  } catch (error) {
    console.error("Error in getApprovedResources:", error);
    return [];
  }
}

export async function invalidateResourceCache() {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      try {
        await redis.del(CACHE_KEY);
        console.log("Invalidated Redis resource cache");
      } catch(e) {}
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to invalidate cache:", error);
    return { success: false, error };
  }
}
