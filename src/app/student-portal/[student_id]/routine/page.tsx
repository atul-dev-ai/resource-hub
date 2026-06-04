import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import RoutineClient from "./RoutineClient";

export default async function RoutinePage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  return <RoutineClient />;
}