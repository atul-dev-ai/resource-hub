import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import RoutineClient from "./RoutineClient";

import { getClassRoutines, getStudentRoutineData } from "@/app/actions/studentActions";

export default async function RoutinePage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const { profile, myRoutine } = await getStudentRoutineData();
  const { rooms: allRooms, routines: allRoutines } = await getClassRoutines();

  return (
    <RoutineClient 
      profile={profile} 
      myRoutine={myRoutine} 
      allRooms={allRooms || []} 
      allRoutines={allRoutines || []} 
    />
  );
}