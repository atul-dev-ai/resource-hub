"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Building2, User, SearchX, Hash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getClassRoutines, getStudentRoutineData } from "@/app/actions/studentActions";
import PremiumLoading from "@/components/PremiumLoading";

const cardColors = [
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", accent: "bg-emerald-600", tag: "bg-emerald-100" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", accent: "bg-pink-600", tag: "bg-pink-100" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", accent: "bg-indigo-600", tag: "bg-indigo-100" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", accent: "bg-amber-600", tag: "bg-amber-100" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", accent: "bg-rose-600", tag: "bg-rose-100" },
];

export default function RoutineClient() {
  const [activeTab, setActiveTab] = useState<'my-routine' | 'empty-rooms'>('my-routine');
  const [currentDay, setCurrentDay] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [emptyRoomsList, setEmptyRoomsList] = useState<any[]>([]);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const { data: routineData, isLoading: loadingRoutine } = useQuery({
    queryKey: ["student_routine_data"],
    queryFn: getStudentRoutineData,
  });

  const { data: allRoutinesData, isLoading: loadingAll } = useQuery({
    queryKey: ["global_class_routines"],
    queryFn: getClassRoutines,
  });

  const profile = routineData?.profile || null;
  const myRoutine = routineData?.myRoutine || [];
  const allRooms = allRoutinesData?.rooms || [];
  const allRoutines = allRoutinesData?.routines || [];

  useEffect(() => {
    if (loadingAll) return;
    const updateTimeAndRooms = () => {
      const now = new Date();
      const today = now.toLocaleDateString('en-US', { weekday: 'long' });
      const timeString = now.toTimeString().split(' ')[0]; 

      setCurrentDay(today);
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

      const occupiedRoomIds = allRoutines
        .filter((r: any) => r.day_of_week === today && r.start_time <= timeString && r.end_time >= timeString)
        .map((r: any) => r.room_id);

      const currentlyEmpty = allRooms.filter((room: any) => !occupiedRoomIds.includes(room.id));
      setEmptyRoomsList(currentlyEmpty);
    };

    updateTimeAndRooms();
    const interval = setInterval(updateTimeAndRooms, 60000);
    return () => clearInterval(interval);
  }, [allRooms, allRoutines, loadingAll]);

  const groupedRoutine = daysOfWeek.reduce((acc, day) => {
    acc[day] = myRoutine.filter((r: any) => r.day_of_week === day);
    return acc;
  }, {} as Record<string, any[]>);

  const formatTime = (timeDb: string) => {
    const [h, m] = timeDb.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loadingRoutine || loadingAll) return <PremiumLoading />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Academic Routine</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Personalized schedule for your academic success.</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {profile?.student_id && (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">{profile.student_id}</span>
          )}
          {profile?.department && (
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100 uppercase">{profile.department}</span>
          )}
          {profile?.semester && (
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">{profile.semester}</span>
          )}
          {profile?.section && (
            <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100 uppercase">{profile.section}</span>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button onClick={() => setActiveTab('my-routine')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'my-routine' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Calendar className="inline w-4 h-4 mr-2" /> My Routine
        </button>
        <button onClick={() => setActiveTab('empty-rooms')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === 'empty-rooms' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Building2 className="w-4 h-4" /> Empty Rooms (Live)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'my-routine' && (
          <motion.div key="routine" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            {myRoutine.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <SearchX size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No Routine Found</h3>
                <p className="text-gray-500 mt-2">Ensure your department, semester, and section are correctly set in your profile.</p>
              </div>
            ) : (
              daysOfWeek.map(day => groupedRoutine[day]?.length > 0 && (
                <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      {day === currentDay && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>}
                      {day}
                    </h2>
                    {day === currentDay && <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">Today</span>}
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groupedRoutine[day].map((cls: any, idx: number) => {
                      const color = cardColors[idx % cardColors.length];
                      
                      return (
                        <div key={idx} className={`${color.bg} ${color.border} border-2 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}>
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${color.accent}`}></div>
                          
                          <div className="flex justify-between items-start mb-3">
                            <span className={`${color.tag} ${color.text} px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wider`}>
                              {cls.courses?.course_code}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-lg">
                               <Hash size={12} /> {cls.section}
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-gray-900 text-base mb-4 leading-tight min-h-[40px] line-clamp-2">
                            {cls.courses?.course_name}
                          </h3>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <div className={`p-1.5 rounded-lg ${color.tag}`}>
                                <Clock size={14} className={color.text} />
                              </div>
                              {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <div className={`p-1.5 rounded-lg ${color.tag}`}>
                                <MapPin size={14} className={color.text} />
                              </div>
                              {cls.rooms?.room_number} <span className="text-gray-400 font-medium">({cls.rooms?.building})</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <div className={`p-1.5 rounded-lg ${color.tag}`}>
                                <User size={14} className={color.text} />
                              </div>
                              {cls.teacher_name}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
        
        {activeTab === 'empty-rooms' && (
           <motion.div key="empty-rooms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {emptyRoomsList.map((room: any) => (
                   <div key={room.id} className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-all hover:border-green-400">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                         <MapPin size={20} />
                      </div>
                      <h3 className="font-black text-gray-800 text-lg">{room.room_number}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{room.building}</p>
                   </div>
                ))}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}