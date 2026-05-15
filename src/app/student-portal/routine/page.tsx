import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import RoutineClient from "./RoutineClient";

export default async function RoutinePage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('department, semester, section')
    .eq('id', session.user.id)
    .single();

  let myRoutine: any[] = [];
  if (profile) {
    /** * ✅ নতুন লজিক: 
     * যদি সেকশন '22_A1' বা '22_A2' হয়, তবে শেষের সংখ্যাটা বাদ দিয়ে '22_A' বের করা হবে।
     * এতে করে থিওরি (22_A) এবং সব ল্যাব (22_A1, 22_A2) এর ডেটা একসাথে আসবে।
     */
    const baseSection = profile.section.replace(/\d$/, ''); // শেষের ডিজিট (1, 2) থাকলে রিমুভ করবে
    
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

  const { data: allRooms } = await supabase.from('rooms').select('*').order('room_number');
  const { data: allRoutines } = await supabase.from('academic_routines').select('room_id, day_of_week, start_time, end_time');

  return (
    <RoutineClient 
      profile={profile} 
      myRoutine={myRoutine} 
      allRooms={allRooms || []} 
      allRoutines={allRoutines || []} 
    />
  );
}