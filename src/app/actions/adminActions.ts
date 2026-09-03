"use server";

import { createClient } from "@/utils/supabase/server";
import { Redis } from "@upstash/redis";

// Helper to get Redis instance safely
function getRedis() {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  } catch (e) {
    console.error("Redis Init Error:", e);
  }
  return null;
}

// ---------------------------------------------------------------------------
// 1. Admin Dashboard Stats
// ---------------------------------------------------------------------------
export async function getAdminDashboardStats() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const CACHE_KEY = `admin_dashboard_stats`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        console.log(`Redis Cache Hit: ${CACHE_KEY}`);
        return cached as any;
      }
    } catch (e) {
      console.error(`Redis Get Error (${CACHE_KEY}):`, e);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const [
    { count: totalUsers },
    { count: totalUploads },
    { count: pendingApprovals },
    { count: approvedToday },
    { count: rejectedToday },
    { count: reportsPending },
    { count: activeModerators }
  ] = await Promise.all([
    supabase.from("profiles").select('*', { count: 'exact', head: true }),
    supabase.from("resources").select('*', { count: 'exact', head: true }),
    supabase.from("resources").select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from("resources").select('*', { count: 'exact', head: true }).eq('status', 'approved').gte('created_at', todayStr),
    supabase.from("resources").select('*', { count: 'exact', head: true }).eq('status', 'rejected').gte('created_at', todayStr),
    supabase.from("reports").select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from("profiles").select('*', { count: 'exact', head: true }).in('role', ['admin', 'moderator', 'super_admin'])
  ]);

  const stats = {
    totalUsers: totalUsers || 0,
    totalUploads: totalUploads || 0,
    pendingApprovals: pendingApprovals || 0,
    approvedToday: approvedToday || 0,
    rejectedToday: rejectedToday || 0,
    reportsPending: reportsPending || 0,
    activeModerators: activeModerators || 0
  };

  if (redis) {
    try {
      await redis.set(CACHE_KEY, stats, { ex: 60 }); // 1 minute TTL for stats
    } catch (e) {}
  }

  return stats;
}

export async function invalidateAdminDashboardStats() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`admin_dashboard_stats`);
    } catch (e) {}
  }
}

// ---------------------------------------------------------------------------
// 2. Pending Resources
// ---------------------------------------------------------------------------
export async function getPendingResources() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const CACHE_KEY = `admin_pending_resources`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any[];
    } catch (e) {}
  }

  const { data, error } = await supabase
    .from("resources")
    .select(`
      *,
      profiles:uploader_id(full_name, email, department, student_id)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  
  if (redis) {
    try {
      await redis.set(CACHE_KEY, data, { ex: 300 }); // 5 minutes TTL
    } catch (e) {}
  }

  return data || [];
}

export async function invalidatePendingResources() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`admin_pending_resources`);
      await redis.del(`admin_all_resources`);
      await redis.del(`admin_dashboard_stats`);
    } catch (e) {}
  }
}

// ---------------------------------------------------------------------------
// 2.5 All Resources
// ---------------------------------------------------------------------------
export async function getAllAdminResources() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const CACHE_KEY = `admin_all_resources`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any[];
    } catch (e) {}
  }

  const { data, error } = await supabase
    .from("resources")
    .select(`
      *,
      profiles(full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  if (redis) {
    try {
      await redis.set(CACHE_KEY, data, { ex: 300 }); // 5 minutes TTL
    } catch (e) {}
  }

  return data || [];
}

export async function invalidateAllAdminResources() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`admin_all_resources`);
      await redis.del(`admin_dashboard_stats`);
    } catch (e) {}
  }
}

// ---------------------------------------------------------------------------
// 3. All Users Management
// ---------------------------------------------------------------------------
export async function getAllUsers() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const CACHE_KEY = `admin_all_users`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any[];
    } catch (e) {}
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  if (redis) {
    try {
      await redis.set(CACHE_KEY, data, { ex: 300 }); // 5 mins
    } catch (e) {}
  }

  return data || [];
}

export async function invalidateAllUsers() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`admin_all_users`);
      await redis.del(`admin_dashboard_stats`);
    } catch (e) {}
  }
}

// ---------------------------------------------------------------------------
// 4. Admin Logs
// ---------------------------------------------------------------------------
export async function getAdminLogs() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const CACHE_KEY = `admin_logs`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any[];
    } catch (e) {}
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select(`*`)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  
  if (redis) {
    try {
      await redis.set(CACHE_KEY, data, { ex: 60 }); // 1 min TTL
    } catch (e) {}
  }

  return data || [];
}

export async function invalidateAdminLogs() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`admin_logs`);
    } catch (e) {}
  }
}

// ---------------------------------------------------------------------------
// 5. Admin Reports
// ---------------------------------------------------------------------------
export async function getAdminReports() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const CACHE_KEY = `admin_reports`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any[];
    } catch (e) {}
  }

  const { data: reportsData, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  let data = reportsData || [];

  if (data.length > 0) {
    const reporterIds = [...new Set(data.map(r => r.user_id).filter(Boolean))];
    if (reporterIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email, department")
        .in("id", reporterIds);
      
      if (profilesData) {
        data = data.map((report: any) => ({
          ...report,
          profiles: profilesData.find(p => p.id === report.user_id) || null
        }));
      }
    }
  }
  
  if (redis) {
    try {
      await redis.set(CACHE_KEY, data, { ex: 300 });
    } catch (e) {}
  }

  return data || [];
}

export async function invalidateAdminReports() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`admin_reports`);
      await redis.del(`admin_dashboard_stats`);
    } catch (e) {}
  }
}

// ---------------------------------------------------------------------------
// 6. Academic Structure Data
// ---------------------------------------------------------------------------
export async function getAcademicStructureData() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const CACHE_KEY = `admin_academic_structure`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any;
    } catch (e) {}
  }

  const [facRes, deptRes, courseRes, sessionRes] = await Promise.all([
    supabase.from("faculties").select("*").order("name"),
    supabase.from("departments").select("*, faculties(name)").order("code"),
    supabase.from("courses").select("*").order("semester"),
    supabase.from("academic_sessions").select("*").order("year", { ascending: false })
  ]);

  const result = {
    faculties: facRes.data || [],
    departments: deptRes.data || [],
    courses: courseRes.data || [],
    sessions: sessionRes.data || []
  };
  
  if (redis) {
    try {
      await redis.set(CACHE_KEY, result, { ex: 3600 }); // 1 hour
    } catch (e) {}
  }

  return result;
}

export async function invalidateAcademicStructure() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`admin_academic_structure`);
    } catch (e) {}
  }
}

// ---------------------------------------------------------------------------
// 7. Announcements
// ---------------------------------------------------------------------------
export async function getAnnouncementsList() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const CACHE_KEY = `admin_announcements`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any[];
    } catch (e) {}
  }

  const { data, error } = await supabase
    .from("announcements")
    .select(`
      *,
      profiles(full_name, role)
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  if (redis) {
    try {
      await redis.set(CACHE_KEY, data, { ex: 3600 });
    } catch (e) {}
  }

  return data || [];
}

export async function invalidateAnnouncementsList() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`admin_announcements`);
    } catch (e) {}
  }
}

// ---------------------------------------------------------------------------
// 8. Routine Data
// ---------------------------------------------------------------------------
export async function getAdminRoutineData() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const CACHE_KEY = `admin_routine_data`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any;
    } catch (e) {}
  }

  const [roomsRes, coursesRes, deptsRes, semsRes, routinesRes] = await Promise.all([
    supabase.from("rooms").select("*").order("room_number"),
    supabase.from("courses").select("id, course_code, course_name"),
    supabase.from("departments").select("code, name"),
    supabase.from("semesters").select("name"),
    supabase.from("academic_routines").select("*").order("id", { ascending: false })
  ]);

  const result = {
    rooms: roomsRes.data || [],
    courses: coursesRes.data || [],
    departments: deptsRes.data || [],
    semesters: semsRes.data || [],
    routines: routinesRes.data || []
  };

  if (redis) {
    try {
      await redis.set(CACHE_KEY, result, { ex: 3600 });
    } catch (e) {}
  }

  return result;
}

export async function invalidateAdminRoutineData() {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`admin_routine_data`);
      await redis.del(`global_class_routines`);
      
      // Clear all student routine caches
      let cursor = '0';
      do {
        const res = await redis.scan(cursor, { match: 'student_routine_v2_*', count: 1000 });
        cursor = res[0];
        const keys = res[1];
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch (e) {
      console.error("Cache invalidation error:", e);
    }
  }
}
