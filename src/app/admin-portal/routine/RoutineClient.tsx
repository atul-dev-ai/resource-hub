"use client";

import { useState, useEffect } from "react";
import { PlusCircle, MapPin, CalendarDays, Clock, Building, Users, BookOpen, Edit, X, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import PremiumLoading from "@/components/PremiumLoading";

export default function RoutineClient() {
  const [activeTab, setActiveTab] = useState<'routine' | 'rooms'>('routine');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  // Data States
  const [rooms, setRooms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);

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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [roomsRes, coursesRes, deptsRes, semsRes, routinesRes] = await Promise.all([
        supabase.from("rooms").select("*").order("room_number"),
        supabase.from("courses").select("id, course_code, course_name"),
        supabase.from("departments").select("code, name"),
        supabase.from("semesters").select("name"),
        supabase.from("academic_routines").select("*").order("id", { ascending: false })
      ]);

      if (roomsRes.data) setRooms(roomsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (deptsRes.data) setDepartments(deptsRes.data);
      if (semsRes.data) setSemesters(semsRes.data);
      if (routinesRes.data) setRoutines(routinesRes.data);
    } catch (error) {
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
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
        const { data, error } = await supabase.from('rooms').update(roomData).eq('id', roomForm.id).select();
        if (error) throw error;
        toast.success("Room updated successfully!", { id: toastId });
        if (data) setRooms(rooms.map(r => r.id === roomForm.id ? data[0] : r));
        setIsEditingRoom(false);
      } else {
        const { data, error } = await supabase.from('rooms').insert([roomData]).select();
        if (error) throw error;
        toast.success("Room added successfully!", { id: toastId });
        if (data) setRooms([...rooms, data[0]]);
      }
      // Reset Full Form
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
    if (!window.confirm("Are you sure you want to delete this room? It will also delete all routines associated with it!")) return;
    
    const toastId = toast.loading("Deleting room...");
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      toast.success("Room deleted successfully", { id: toastId });
      setRooms(rooms.filter(r => r.id !== id));
      setRoutines(routines.filter(r => r.room_id !== id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete room", { id: toastId });
    }
  };

  // --- ROUTINE MANAGEMENT ---
  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize Time function (Converts "10:00:00" to "10:00" to avoid string comparison bugs)
    const normTime = (t: string) => t.substring(0, 5);

    const formStart = normTime(routineForm.start_time);
    const formEnd = normTime(routineForm.end_time);

    // Validation: Start time must be before End time
    if (formStart >= formEnd) {
      toast.error("Start time must be earlier than end time!");
      return;
    }

    // Validation: Check Overlaps & Conflicts (Fixed exact time boundary issue)
    const isOverlap = (start1: string, end1: string, start2: string, end2: string) => {
      return normTime(start1) < normTime(end2) && normTime(end1) > normTime(start2); 
    };

    let hasConflict = false;
    for (const r of routines) {
      if (isEditingRoutine && r.id === routineForm.id) continue;
      
      if (r.day_of_week === routineForm.day_of_week) {
        if (isOverlap(formStart, formEnd, r.start_time, r.end_time)) {
          
          if (r.room_id === routineForm.room_id) {
            toast.error(`Room Conflict! This room is already booked from ${normTime(r.start_time)} to ${normTime(r.end_time)}.`);
            hasConflict = true;
            break;
          }
          
          if (r.department === routineForm.department && r.batch === routineForm.batch && r.section === routineForm.section) {
            toast.error(`Class Conflict! This batch & section already has a class from ${normTime(r.start_time)} to ${normTime(r.end_time)}.`);
            hasConflict = true;
            break;
          }
        }
      }
    }

    if (hasConflict) return;

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
        const { data, error } = await supabase.from('academic_routines').update(routineData).eq('id', routineForm.id).select();
        if (error) throw error;
        toast.success("Routine updated successfully!", { id: toastId });
        if (data) setRoutines(routines.map(r => r.id === routineForm.id ? data[0] : r));
        setIsEditingRoutine(false);
      } else {
        const { data, error } = await supabase.from('academic_routines').insert([routineData]).select();
        if (error) throw error;
        toast.success("Routine added successfully!", { id: toastId });
        if (data) setRoutines([data[0], ...routines]);
      }
      
      // ✅ Completely reset the form
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
    // ✅ Completely reset the form on cancel
    setRoutineForm({
      id: '', room_id: '', day_of_week: 'Monday', start_time: '', end_time: '',
      course_id: '', department: '', batch: '', semester: '', section: '', teacher_name: ''
    });
    setIsEditingRoutine(false);
  };

  const deleteRoutine = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    
    const toastId = toast.loading("Deleting schedule...");
    try {
      const { error } = await supabase.from('academic_routines').delete().eq('id', id);
      if (error) throw error;
      toast.success("Schedule deleted successfully", { id: toastId });
      setRoutines(routines.filter(r => r.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete schedule", { id: toastId });
    }
  };

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
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number} ({r.building})</option>)}
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
                  {courses.map(c => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
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
                  {departments.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Semester</label>
                <select required value={routineForm.semester} onChange={e => setRoutineForm({...routineForm, semester: e.target.value})} className="w-full border border-gray-300 text-gray-700 bg-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none cursor-pointer">
                  <option value="">-- Sem --</option>
                  {semesters.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Existing Schedules</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Day</th>
                    <th className="px-6 py-3 font-semibold">Time</th>
                    <th className="px-6 py-3 font-semibold">Course</th>
                    <th className="px-6 py-3 font-semibold">Room</th>
                    <th className="px-6 py-3 font-semibold">Dept & Batch</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {routines.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400 font-medium">No schedules added yet.</td></tr>
                  ) : (
                    routines.map(routine => {
                      const course = courses.find(c => c.id === routine.course_id);
                      const room = rooms.find(r => r.id === routine.room_id);
                      return (
                        <tr key={routine.id} className={`hover:bg-pink-50 transition-colors ${isEditingRoutine && routineForm.id === routine.id ? 'bg-pink-50/50' : ''}`}>
                          <td className="px-6 py-3 font-bold text-gray-800">{routine.day_of_week}</td>
                          <td className="px-6 py-3 text-gray-600">{routine.start_time.substring(0,5)} - {routine.end_time.substring(0,5)}</td>
                          <td className="px-6 py-3 text-gray-800">
                            <span className="font-semibold">{course?.course_code}</span>
                            <span className="text-gray-500 ml-1">- {course?.course_name || 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-3 text-gray-800">{room?.room_number || 'Unknown'}</td>
                          <td className="px-6 py-3 text-gray-600">{routine.department} ({routine.batch}-{routine.section})</td>
                          <td className="px-6 py-3 text-right flex justify-end gap-3">
                            <button onClick={() => editRoutine(routine)} className="text-blue-600 hover:text-blue-800 font-bold p-1 cursor-pointer" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => deleteRoutine(routine.id)} className="text-red-500 hover:text-red-700 font-bold p-1 cursor-pointer" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
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
                    rooms.map(room => (
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