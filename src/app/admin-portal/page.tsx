import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function AdminPortalRedirect() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase.from("profiles").select("student_id, role").eq("id", user.id).single();
  
  if (!data || !['super_admin', 'admin', 'moderator'].includes(data.role)) {
    redirect("/student-portal");
  }

  const studentId = data?.student_id || "admin";
  redirect(`/admin-portal/${studentId}`);
}
