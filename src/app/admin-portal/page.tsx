"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminPortalRedirect() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const redirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase.from("profiles").select("student_id, role").eq("id", user.id).single();
      
      if (!data || !['super_admin', 'admin', 'moderator'].includes(data.role)) {
        router.push("/student-portal");
        return;
      }

      const studentId = data?.student_id || "admin";
      router.push(`/admin-portal/${studentId}`);
    };
    redirect();
  }, [router, supabase]);

  return <div className="flex h-screen items-center justify-center bg-gray-50 text-pink-700 font-bold">Loading Admin Portal...</div>;
}
