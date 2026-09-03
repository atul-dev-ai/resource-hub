"use client";

import { useState } from "react";
import { PlusCircle, MapPin, CalendarDays, Clock, Building, Users, BookOpen, Edit, X, Trash2, Hash, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import PremiumLoading from "@/components/PremiumLoading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminRoutineData, invalidateAdminRoutineData } from "@/app/actions/adminActions";
import { confirmAlert } from "@/utils/toastConfirm";
import { logActivity } from "@/utils/logger";

const cardColors = [
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", accent: "bg-emerald-600", tag: "bg-emerald-100" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", accent: "bg-pink-600", tag: "bg-pink-100" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", accent: "bg-indigo-600", tag: "bg-indigo-100" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", accent: "bg-amber-600", tag: "bg-amber-100" },
  { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", accent: "bg-rose-600", tag: "bg-rose-100" },
];

export default function RoutineClient() {
  const [activeTab, setActiveTab] = useState<'routine' | 'rooms'>('routine');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch Data using React Query
  const { data: routineData, isLoading: loading } = useQuery({
    queryKey: ["admin_routine_data"],
    queryFn: getAdminRoutineData,
  });

  const rooms = routineData?.rooms || [];
  const courses = routineData?.courses || [];
  const departments = routineData?.departments || [];
  const semesters = routineData?.semesters || [];
  const routines = routineData?.routines || [];

  // Room Form State
  const [roomForm, setRoomForm] = useState({ id: '', room_number: '', building: '', room_type: 'Classroom' });
  const [isEditingRoom, setIsEditingRoom] = useState(false);

  // Routine Form State
  const [routineForm, setRoutineForm] = useState({
    id: '', room_id: '', day_of_week: 'Monday', start_time: '', end_time: '',
    course_id: '', department: '', batch: '', semester: '', section: '', teacher_name: ''
  });
  const [isEditingRoutine, setIsEditingRoutine] = useState(false);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const refreshData = async () => {
    await invalidateAdminRoutineData();
    queryClient.invalidateQueries({ queryKey: ["admin_routine_data"] });
  };

  // --- ROOM MANAGEMENT ---
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading(isEditingRoom ? "Updating room..." : "Adding room...");

    try {
      const roomData = {
        room_number: roomForm.room_number,
        building: roomForm.building,
        room_type: roomForm.room_type
      };

      if (isEditingRoom) {
        const { error } = await supabase.from('rooms').update(roomData).eq('id', roomForm.id);
        if (error) throw error;
        await logActivity("UPDATE_ROOM", `Updated room: ${roomForm.room_number}`);
        toast.success("Room updated successfully!", { id: toastId });
      } else {
        const { error } = await supabase.from('rooms').insert([roomData]);
        if (error) throw error;
        await logActivity("CREATE_ROOM", `Added room: ${roomForm.room_number}`);
        toast.success("Room added successfully!", { id: toastId });
      }
      
      await refreshData();
      setIsEditingRoom(false);
      setRoomForm({ id: '', room_number: '', building: '', room_type: 'Classroom' });
    } catch (error: any) {
      toast.error(error.message || "Failed to save room", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const editRoom = (room: any) => {
    setRoomForm({ id: room.id, room_number: room.room_number, building: room.building, room_type: room.room_type });
    setIsEditingRoom(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditRoom = () => {
    setRoomForm({ id: '', room_number: '', building: '', room_type: 'Classroom' });
    setIsEditingRoom(false);
  };

  const deleteRoom = async (id: string) => {
    const isConfirmed = await confirmAlert("Are you sure you want to delete this room? It will also delete all routines associated with it!");
    if (!isConfirmed) return;
    
    const toastId = toast.loading("Deleting room...");
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      await logActivity("DELETE_ROOM", `Deleted room ID: ${id}`);
      toast.success("Room deleted successfully", { id: toastId });
      
      await refreshData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete room", { id: toastId });
    }
  };

  // --- ROUTINE MANAGEMENT ---
  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normTime = (t: string) => t.substring(0, 5);
    const formStart = normTime(routineForm.start_time);
    const formEnd = normTime(routineForm.end_time);

    if (formStart >= formEnd) {
      toast.error("Start time must be earlier than end time!");
      return;
    }

    const isOverlap = (start1: string, end1: string, start2: string, end2: string) => {
      return normTime(start1) < normTime(end2) && normTime(end1) > normTime(start2); 
    };

    let conflictWarning = "";
    for (const r of routines) {
      if (isEditingRoutine && r.id === routineForm.id) continue;
      
      if (r.day_of_week === routineForm.day_of_week) {
        if (isOverlap(formStart, formEnd, r.start_time, r.end_time)) {
          
          if (r.room_id === routineForm.room_id) {
            conflictWarning = `Room Conflict! This room is already booked from ${normTime(r.start_time)} to ${normTime(r.end_time)}. Do you want to force save anyway?`;
            break;
          }
          
          if (r.department === routineForm.department && r.batch === routineForm.batch && r.section === routineForm.section) {
            conflictWarning = `Class Conflict! This batch & section already has a class from ${normTime(r.start_time)} to ${normTime(r.end_time)}. Do you want to force save anyway?`;
            break;
          }

          if (r.teacher_name && r.teacher_name.toLowerCase() === routineForm.teacher_name.trim().toLowerCase()) {
            conflictWarning = `Teacher Conflict! ${r.teacher_name} is already taking a class from ${normTime(r.start_time)} to ${normTime(r.end_time)}. Do you want to force save anyway?`;
            break;
          }
        }
      }
    }

    if (conflictWarning) {
      const forceSave = await confirmAlert(conflictWarning);
      if (!forceSave) return;
    }

    setSubmitting(true);
    const toastId = toast.loading(isEditingRoutine ? "Updating routine..." : "Saving routine...");

    try {
      const routineData = {
        room_id: routineForm.room_id,
        day_of_week: routineForm.day_of_week,
        start_time: routineForm.start_time,
        end_time: routineForm.end_time,
        course_id: routineForm.course_id,
        department: routineForm.department,
        batch: routineForm.batch,
        semester: routineForm.semester,
        section: routineForm.section,
        teacher_name: routineForm.teacher_name
      };

      if (isEditingRoutine) {
        const { error } = await supabase.from('academic_routines').update(routineData).eq('id', routineForm.id);
        if (error) throw error;
        await logActivity("UPDATE_ROUTINE", `Updated routine for Batch ${routineForm.batch} in Room ID: ${routineForm.room_id}`);
        toast.success("Routine updated successfully!", { id: toastId });
      } else {
        const { error } = await supabase.from('academic_routines').insert([routineData]);
        if (error) throw error;
        await logActivity("CREATE_ROUTINE", `Added routine for Batch ${routineForm.batch} in Room ID: ${routineForm.room_id}`);
        toast.success("Routine added successfully!", { id: toastId });
      }
      
      await refreshData();
      setIsEditingRoutine(false);
      setRoutineForm({
        id: '', room_id: '', day_of_week: 'Monday', start_time: '', end_time: '',
        course_id: '', department: '', batch: '', semester: '', section: '', teacher_name: ''
      });
      
    } catch (error: any) {
      toast.error(error.message || "Failed to save routine", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const editRoutine = (routine: any) => {
    setRoutineForm({
      id: routine.id,
      room_id: routine.room_id,
      day_of_week: routine.day_of_week,
      start_time: routine.start_time,
      end_time: routine.end_time,
      course_id: routine.course_id,
      department: routine.department,
      batch: routine.batch,
      semester: routine.semester,
      section: routine.section,
      teacher_name: routine.teacher_name
    });
    setIsEditingRoutine(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditRoutine = () => {
    setRoutineForm({
      id: '', room_id: '', day_of_week: 'Monday', start_time: '', end_time: '',
      course_id: '', department: '', batch: '', semester: '', section: '', teacher_name: ''
    });
    setIsEditingRoutine(false);
  };

  const deleteRoutine = async (id: string) => {
    const isConfirmed = await confirmAlert("Are you sure you want to delete this schedule?");
    if (!isConfirmed) return;
    
    const toastId = toast.loading("Deleting schedule...");
    try {
      const { error } = await supabase.from('academic_routines').delete().eq('id', id);
      if (error) throw error;
      await logActivity("DELETE_ROUTINE", `Deleted schedule ID: ${id}`);
      toast.success("Schedule deleted successfully", { id: toastId });
      
      await refreshData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete schedule", { id: toastId });
    }
  };

  const formatTime = (timeDb: string) => {
    if(!timeDb) return "";
    const [h, m] = timeDb.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const groupedRoutine = daysOfWeek.reduce((acc, day) => {
    acc[day] = routines.filter((r: any) => r.day_of_week === day);
    acc[day].sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return <PremiumLoading />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto bg-transparent">
      <Toaster position="top-right" />
      
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Routine & Room Management</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Manage physical classrooms and schedule academic routines.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('routine')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'routine' ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CalendarDays className="inline w-4 h-4 mr-2" />
          Assign Routine
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'rooms' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin className="inline w-4 h-4 mr-2" />
          Manage Rooms
        </button>
      </div>

      {/* Routine Assignment Form & List */}
      {activeTab === 'routine' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-pink-100 shadow-sm relative">
            {isEditingRoutine && (
              <div className="absolute top-0 left-0 w-full h-1 bg-pink-500 rounded-t-xl"></div>
            )}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {isEditingRoutine ? (
                  <><Edit size={18} className="text-pink-600" /> Update Class Schedule</>
                ) : (
                  <><PlusCircle size={18} className="text-pink-600" /> Add New Class Schedule</>
                )}
              </h2>
              {isEditingRoutine && (
                <button type="button" onClick={cancelEditRoutine} className="text-sm font-bold text-gray-500 hover:text-red-500 flex items-center gap-1 cursor-pointer">
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
            
            <form onSubmit={handleSaveRoutine} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Select Room</label>
                <select required value={routineForm.room_id} onChange={e => setRoutineForm({...routineForm, room_id: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer">
                  <option value="">-- Choose Room --</option>
                  {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.room_number} ({r.building})</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Day of Week</label>
                <select required value={routineForm.day_of_week} onChange={e => setRoutineForm({...routineForm, day_of_week: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer">
                  <option value="">-- Select Day --</option>
                  {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Course</label>
                <select required value={routineForm.course_id} onChange={e => setRoutineForm({...routineForm, course_id: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer">
                  <option value="">-- Choose Course --</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input type="time" required value={routineForm.start_time} onChange={e => setRoutineForm({...routineForm, start_time: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 pl-9 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input type="time" required value={routineForm.end_time} onChange={e => setRoutineForm({...routineForm, end_time: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 pl-9 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                <select required value={routineForm.department} onChange={e => setRoutineForm({...routineForm, department: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer">
                  <option value="">-- Dept --</option>
                  {departments.map((d: any) => <option key={d.code} value={d.code}>{d.code}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Semester</label>
                <select required value={routineForm.semester} onChange={e => setRoutineForm({...routineForm, semester: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer">
                  <option value="">-- Sem --</option>
                  {semesters.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Batch</label>
                <input type="text" placeholder="e.g. 252" required value={routineForm.batch} onChange={e => setRoutineForm({...routineForm, batch: e.target.value})} className="w-full border text-gray-700 bg-white border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Section</label>
                <input type="text" placeholder="e.g. 22_A2" required value={routineForm.section} onChange={e => setRoutineForm({...routineForm, section: e.target.value})} className="w-full border text-gray-700 bg-white border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
              </div>

              <div className="space-y-1 lg:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Teacher Name / Initial</label>
                <input type="text" placeholder="e.g. SRK (Shah Rukh Khan)" required value={routineForm.teacher_name} onChange={e => setRoutineForm({...routineForm, teacher_name: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
              </div>

              <div className="lg:col-span-3 flex justify-end mt-2">
                <button disabled={submitting} type="submit" className="bg-pink-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-400 cursor-pointer shadow-sm">
                  {submitting ? 'Saving...' : (isEditingRoutine ? 'Update Schedule' : 'Save Schedule')}
                </button>
              </div>
            </form>
          </div>

          {/* List of Routines */}
          <div className="space-y-6">
            {routines.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 font-medium shadow-sm">
                No schedules added yet.
              </div>
            ) : (
              daysOfWeek.map(day => groupedRoutine[day]?.length > 0 && (
                <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">{day}</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {groupedRoutine[day].map((routine: any, idx: number) => {
                      const course = courses.find((c: any) => c.id === routine.course_id);
                      const room = rooms.find((r: any) => r.id === routine.room_id);
                      const color = cardColors[idx % cardColors.length];
                      
                      return (
                        <div key={routine.id} className={`${color.bg} ${color.border} border-2 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group relative overflow-hidden ${isEditingRoutine && routineForm.id === routine.id ? 'ring-4 ring-pink-300' : ''}`}>
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${color.accent}`}></div>
                          
                          <div className="flex justify-between items-start mb-3">
                            <span className={`${color.tag} ${color.text} px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wider`}>
                              {course?.course_code || 'Unknown'}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-lg">
                               <Hash size={12} /> {routine.department} ({routine.semester}, {routine.batch}-{routine.section})
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-gray-900 text-base mb-4 leading-tight min-h-[40px] line-clamp-2">
                            {course?.course_name || 'Unknown Course'}
                          </h3>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <div className={`p-1.5 rounded-lg ${color.tag}`}>
                                <Clock size={14} className={color.text} />
                              </div>
                              {formatTime(routine.start_time)} - {formatTime(routine.end_time)}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <div className={`p-1.5 rounded-lg ${color.tag}`}>
                                <MapPin size={14} className={color.text} />
                              </div>
                              {room?.room_number || 'Unknown'} <span className="text-gray-400 font-medium">({room?.building})</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <div className={`p-1.5 rounded-lg ${color.tag}`}>
                                <User size={14} className={color.text} />
                              </div>
                              {routine.teacher_name}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200/50">
                            <button onClick={() => editRoutine(routine)} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 transition-colors shadow-sm cursor-pointer">
                              <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => deleteRoutine(routine.id)} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-white text-red-600 hover:bg-red-50 border border-red-100 transition-colors shadow-sm cursor-pointer">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Rooms Management Form & List */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Add Room Form */}
          <div className="md:col-span-1 bg-white p-6 rounded-xl border border-rose-100 shadow-sm h-fit relative">
            {isEditingRoom && (
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 rounded-t-xl"></div>
            )}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {isEditingRoom ? (
                  <><Edit size={18} className="text-rose-600" /> Update Room</>
                ) : (
                  <><Building size={18} className="text-rose-600" /> Create Room</>
                )}
              </h2>
              {isEditingRoom && (
                <button type="button" onClick={cancelEditRoom} className="text-sm font-bold text-gray-500 hover:text-red-500 flex items-center gap-1 cursor-pointer">
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
            
            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Room Number</label>
                <input type="text" required placeholder="AB-401" value={roomForm.room_number} onChange={e => setRoomForm({...roomForm, room_number: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Building Name</label>
                <input type="text" required placeholder="Main Building" value={roomForm.building} onChange={e => setRoomForm({...roomForm, building: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Room Type</label>
                <select value={roomForm.room_type} onChange={e => setRoomForm({...roomForm, room_type: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none cursor-pointer">
                  <option value="Classroom">Classroom</option>
                  <option value="Lab">Lab</option>
                  <option value="Auditorium">Auditorium</option>
                </select>
              </div>
              <button disabled={submitting} type="submit" className="w-full bg-rose-600 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-rose-700 transition-colors disabled:bg-rose-400 cursor-pointer shadow-sm">
                {submitting ? 'Saving...' : (isEditingRoom ? 'Update Room' : 'Add Room')}
              </button>
            </form>
          </div>

          {/* List of Rooms */}
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Available Rooms</h2>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Room No.</th>
                    <th className="px-6 py-3 font-semibold">Building</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rooms.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-400 font-medium">No rooms added yet.</td></tr>
                  ) : (
                    rooms.map((room: any) => (
                      <tr key={room.id} className={`hover:bg-pink-50 transition-colors ${isEditingRoom && roomForm.id === room.id ? 'bg-rose-50/50' : ''}`}>
                        <td className="px-6 py-3 font-bold text-gray-800">{room.room_number}</td>
                        <td className="px-6 py-3 text-gray-600">{room.building}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${room.room_type === 'Lab' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'}`}>
                            {room.room_type}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right flex justify-end gap-3">
                          <button onClick={() => editRoom(room)} className="text-rose-600 hover:text-rose-800 font-bold p-1 cursor-pointer" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteRoom(room.id)} className="text-red-500 hover:text-red-700 font-bold p-1 cursor-pointer" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}