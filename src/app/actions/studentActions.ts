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
// 1. Dashboard Data
// ---------------------------------------------------------------------------
export async function getStudentDashboardData() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  
  const userId = session.user.id;
  const CACHE_KEY = `student_dashboard_${userId}`;
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

  console.log(`Redis Cache Miss: ${CACHE_KEY}, fetching from DB`);

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
  const userName = profile?.full_name ? profile.full_name.split(" ")[0] : "Student";

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("uploader_id", userId)
    .order("created_at", { ascending: false });

  let stats = { total: 0, approved: 0, pending: 0, views: 0 };
  let recentResources = [];

  if (resources) {
    resources.forEach(res => {
      if (res.status === 'approved') stats.approved++;
      if (res.status === 'pending') stats.pending++;
      stats.views += res.views_count || 0;
    });
    stats.total = resources.length;
    recentResources = resources.slice(0, 5);
  }

  const result = { userName, stats, recentResources };

  if (redis) {
    try {
      await redis.set(CACHE_KEY, result, { ex: 300 }); // 5 minutes TTL
    } catch (e) {}
  }

  return result;
}

// ---------------------------------------------------------------------------
// 2. Profile Data
// ---------------------------------------------------------------------------
export async function getStudentProfile() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const CACHE_KEY = `student_profile_${userId}`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any;
    } catch (e) {}
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;

  const profile = data || {
    id: userId,
    full_name: "",
    student_id: "",
    department: "",
    batch: "",
    email: session.user.email,
  };

  if (redis) {
    try {
      await redis.set(CACHE_KEY, profile, { ex: 3600 }); // 1 hour TTL
    } catch(e) {}
  }
  return profile;
}

export async function invalidateStudentProfile(userId: string) {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`student_profile_${userId}`);
    } catch(e) {}
  }
}

// ---------------------------------------------------------------------------
// 3. Form Metadata (Departments, Semesters, Sessions, Courses)
// ---------------------------------------------------------------------------
export async function getUploadMetadata() {
  const CACHE_KEY = `global_form_metadata`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any;
    } catch (e) {}
  }

  const supabase = await createClient();
  const [depts, sems, sessions, courses] = await Promise.all([
    supabase.from("departments").select("*").order("code"),
    supabase.from("semesters").select("*").order("created_at"),
    supabase.from("academic_sessions").select("*").order("year", { ascending: false }),
    supabase.from("courses").select("*")
  ]);

  const result = {
    departments: depts.data || [],
    semesters: sems.data || [],
    sessions: sessions.data || [],
    courses: courses.data || []
  };

  if (redis) {
    try {
      await redis.set(CACHE_KEY, result, { ex: 86400 }); // 24 hours TTL
    } catch(e) {}
  }
  return result;
}

// ---------------------------------------------------------------------------
// 4. Student Uploads
// ---------------------------------------------------------------------------
export async function getStudentUploads() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const CACHE_KEY = `student_uploads_${userId}`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any[];
    } catch (e) {}
  }

  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("uploader_id", userId)
    .order("created_at", { ascending: false });

  const result = data || [];

  if (redis) {
    try {
      await redis.set(CACHE_KEY, result, { ex: 300 }); // 5 mins
    } catch(e) {}
  }
  return result;
}

export async function invalidateStudentUploads(userId: string) {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`student_uploads_${userId}`);
      await redis.del(`student_dashboard_${userId}`); // Also invalidate dashboard to refresh counts
    } catch(e) {}
  }
}

// ---------------------------------------------------------------------------
// 5. Class Routine
// ---------------------------------------------------------------------------
export async function getClassRoutines() {
  const CACHE_KEY = `global_class_routines`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any;
    } catch (e) {}
  }

  const supabase = await createClient();
  const [roomsRes, routinesRes] = await Promise.all([
    supabase.from('rooms').select('*').order('room_number'),
    supabase.from('academic_routines').select('room_id, day_of_week, start_time, end_time')
  ]);

  const result = {
    rooms: roomsRes.data || [],
    routines: routinesRes.data || []
  };

  if (redis) {
    try {
      await redis.set(CACHE_KEY, result, { ex: 86400 }); // 24 hours
    } catch(e) {}
  }
  return result;
}

export async function getStudentRoutineData() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const CACHE_KEY = `student_routine_${userId}`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any;
    } catch (e) {}
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('department, semester, section, student_id')
    .eq('id', userId)
    .single();

  let myRoutine: any[] = [];
  if (profile && profile.section) {
    const baseSection = profile.section.replace(/\d$/, '');
    const { data: routineData } = await supabase
      .from('academic_routines')
      .select(`
        *,
        rooms(room_number, building, room_type),
        courses(course_code, course_name)
      `)
      .eq('department', profile.department)
      .eq('semester', profile.semester)
      .like('section', `${baseSection}%`) 
      .order('start_time');
      
    myRoutine = routineData || [];
  }

  const result = { profile, myRoutine };

  if (redis) {
    try {
      await redis.set(CACHE_KEY, result, { ex: 3600 }); // 1 hour
    } catch(e) {}
  }
  return result;
}

// ---------------------------------------------------------------------------
// 6. Student Reports
// ---------------------------------------------------------------------------
export async function getStudentReports() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const CACHE_KEY = `student_reports_${userId}`;
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return cached as any[];
    } catch (e) {}
  }

  const { data } = await supabase
    .from("reports")
    .select(`*`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const result = data || [];

  if (redis) {
    try {
      await redis.set(CACHE_KEY, result, { ex: 600 }); // 10 mins
    } catch(e) {}
  }
  return result;
}

export async function invalidateStudentReports(userId: string) {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(`student_reports_${userId}`);
    } catch(e) {}
  }
}
