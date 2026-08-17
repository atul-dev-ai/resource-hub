import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function StudentPortalRedirect() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase.from("profiles").select("student_id").eq("id", user.id).single();
  const studentId = data?.student_id || "new";

  redirect(`/student-portal/${studentId}`);
}
