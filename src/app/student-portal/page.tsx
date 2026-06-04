"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function StudentPortalRedirect() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const redirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase.from("profiles").select("student_id").eq("id", user.id).single();
      const studentId = data?.student_id || "new";
      router.push(`/student-portal/${studentId}`);
    };
    redirect();
  }, [router, supabase]);

  return <div className="flex h-screen items-center justify-center bg-gray-50 text-emerald-700 font-bold">Loading Student Portal...</div>;
}
