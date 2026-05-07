"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, BookOpen, PlusCircle, Trash2, 
  Loader2, GraduationCap, CalendarClock, ArrowRight, Search, Filter 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logActivity } from "@/utils/logger";
import toast from "react-hot-toast";

export default function AcademicStructurePage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"sessions" | "faculties" | "departments" | "courses">("sessions");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Data States
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  // Filter States
  const [filterDeptFaculty, setFilterDeptFaculty] = useState("");
  const [filterCourseDept, setFilterCourseDept] = useState("");
  const [filterCourseSem, setFilterCourseSem] = useState("");

  // Form States
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newDeptFacultyId, setNewDeptFacultyId] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newCourseDept, setNewCourseDept] = useState("");
  const [newCourseSem, setNewCourseSem] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newSessionTerm, setNewSessionTerm] = useState("Spring");
  const [newSessionYear, setNewSessionYear] = useState(new Date().getFullYear().toString());

  const semestersList = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
  const termOptions = ["Spring", "Summer", "Fall", "Short"];

  useEffect(() => {
    fetchData();
  }, [activeTab]); // Refetch slightly on tab change to ensure fresh data

  // Clear search and filters when changing tabs
  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facRes, deptRes, courseRes, sessionRes] = await Promise.all([
        supabase.from("faculties").select("*").order("name"),
        supabase.from("departments").select("*, faculties(name)").order("code"),
        supabase.from("courses").select("*").order("semester"),
        supabase.from("academic_sessions").select("*").order("year", { ascending: false })
      ]);

      setFaculties(facRes.data || []);
      setDepartments(deptRes.data || []);
      setCourses(courseRes.data || []);
      setSessions(sessionRes.data || []);
    } catch (error) {
      toast.error("Failed to load academic data.");
    } finally {
      setLoading(false);
    }
  };

  // ================= 1. SESSION HANDLERS =================
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const shortYear = newSessionYear.slice(-2);
      let termCode = "0";
      if (newSessionTerm === "Spring") termCode = "1";
      else if (newSessionTerm === "Summer") termCode = "2";
      else if (newSessionTerm === "Fall") termCode = "3";
      else if (newSessionTerm === "Short") termCode = "4"; 
      
      const generatedBatchCode = `${shortYear}${termCode}`;

      const { data, error } = await supabase.from("academic_sessions").insert([{ 
        term: newSessionTerm, 
        year: parseInt(newSessionYear),
        batch_code: generatedBatchCode
      }]).select().single();

      if (error) throw error;

      setSessions([data, ...sessions].sort((a, b) => b.year - a.year));
      await logActivity("CREATE_SESSION", `Added Session: ${newSessionTerm} ${newSessionYear} (Batch ${generatedBatchCode})`);
      toast.success(`Session added! Batch code: ${generatedBatchCode}`);
      setNewSessionYear(new Date().getFullYear().toString());
    } catch (error: any) {
      toast.error(error.message || "Failed to add session. Batch code might already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (id: string, batchCode: string) => {
    if (!window.confirm(`Delete session (Batch ${batchCode})? Linked students may lose their batch data.`)) return;
    try {
      const { error } = await supabase.from("academic_sessions").delete().eq("id", id);
      if (error) throw error;
      setSessions(sessions.filter(s => s.id !== id));
      await logActivity("DELETE_SESSION", `Deleted Session with Batch ${batchCode}`);
      toast.success("Session deleted.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // ================= 2. FACULTY HANDLERS =================
  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from("faculties").insert([{ name: newFacultyName }]).select().single();
      if (error) throw error;
      setFaculties([...faculties, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewFacultyName("");
      await logActivity("CREATE_FACULTY", `Added Faculty: ${data.name}`);
      toast.success("Faculty added successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    if (!window.confirm(`Delete Faculty: ${name}?`)) return;
    try {
      const { error } = await supabase.from("faculties").delete().eq("id", id);
      if (error) throw error;
      setFaculties(faculties.filter(f => f.id !== id));
      await logActivity("DELETE_FACULTY", `Deleted Faculty: ${name}`);
      toast.success("Faculty deleted.");
    } catch (error: any) {
      toast.error("Cannot delete faculty. It might have linked departments.");
    }
  };

  // ================= 3. DEPARTMENT HANDLERS =================
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptFacultyId) return toast.error("Please select a Faculty!");
    setIsSubmitting(true);
    try {
      const code = newDeptCode.toUpperCase().trim();
      const { data, error } = await supabase.from("departments").insert([{ 
        code, name: newDeptName, faculty_id: newDeptFacultyId 
      }]).select("*, faculties(name)").single();

      if (error) throw error;
      setDepartments([...departments, data].sort((a, b) => a.code.localeCompare(b.code)));
      setNewDeptCode(""); setNewDeptName(""); setNewDeptFacultyId("");
      await logActivity("CREATE_DEPT", `Added Dept: ${code}`);
      toast.success("Department added!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: string, code: string) => {
    if (!window.confirm(`Delete Department ${code}?`)) return;
    try {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) throw error;
      setDepartments(departments.filter(d => d.id !== id));
      await logActivity("DELETE_DEPT", `Deleted Department: ${code}`);
      toast.success("Department deleted.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // ================= 4. COURSE HANDLERS =================
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const code = newCourseCode.toUpperCase().trim();
      const { data, error } = await supabase.from("courses").insert([{ 
        department_code: newCourseDept, semester: newCourseSem, course_code: code, course_name: newCourseName
      }]).select().single();
      
      if (error) throw error;
      setCourses([...courses, data]);
      setNewCourseCode(""); setNewCourseName("");
      await logActivity("CREATE_COURSE", `Added Course: ${code}`);
      toast.success("Course added!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: string, code: string) => {
    if (!window.confirm(`Delete course ${code}?`)) return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      setCourses(courses.filter(c => c.id !== id));
      await logActivity("DELETE_COURSE", `Deleted Course: ${code}`);
      toast.success("Course deleted.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // ================= FILTERS LOGIC =================
  const filteredDepartments = departments.filter(d => {
    const matchesSearch = d.code.toLowerCase().includes(searchTerm.toLowerCase()) || d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = filterDeptFaculty ? d.faculty_id === filterDeptFaculty : true;
    return matchesSearch && matchesFaculty;
  });

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.course_code.toLowerCase().includes(searchTerm.toLowerCase()) || c.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterCourseDept ? c.department_code === filterCourseDept : true;
    const matchesSem = filterCourseSem ? c.semester === filterCourseSem : true;
    return matchesSearch && matchesDept && matchesSem;
  });


  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Structure</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage Sessions, Faculties, Departments, and Courses.</p>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm overflow-x-auto">
        {[
          { id: "sessions", name: "Sessions & Batches", icon: CalendarClock },
          { id: "faculties", name: "Faculties", icon: GraduationCap },
          { id: "departments", name: "Departments", icon: Building2 },
          { id: "courses", name: "Courses", icon: BookOpen }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-[#064e3b] text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <tab.icon size={18} /> {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* ================= SESSIONS TAB ================= */}
        {activeTab === "sessions" && (
          <motion.div key="sessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Create Academic Session</h3>
              <form onSubmit={handleAddSession} className="flex flex-col sm:flex-row gap-4">
                <select required value={newSessionTerm} onChange={e => setNewSessionTerm(e.target.value)} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 shadow-inner cursor-pointer">
                  {termOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="number" placeholder="Year (e.g., 2026)" required min="2000" max="2100" value={newSessionYear} onChange={e => setNewSessionYear(e.target.value)} className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 shadow-inner" />
                <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-900/20">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Generate Batch Code"}
                </button>
              </form>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-8 py-4">Academic Term</th><th className="px-8 py-4">System Batch Code</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-700">{s.term} {s.year}</td>
                      <td className="px-8 py-5"><span className="text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 font-black">Batch {s.batch_code}</span></td>
                      <td className="px-8 py-5 text-right"><button onClick={() => handleDeleteSession(s.id, s.batch_code)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"><Trash2 size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ================= FACULTIES TAB ================= */}
        {activeTab === "faculties" && (
          <motion.div key="fac" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Register New Faculty</h3>
              <form onSubmit={handleAddFaculty} className="flex flex-col sm:flex-row gap-4">
                <input type="text" placeholder="Faculty Name (e.g., Science & IT)" required value={newFacultyName} onChange={e => setNewFacultyName(e.target.value)} className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 shadow-inner" />
                <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-[#064e3b] text-white font-bold rounded-2xl hover:bg-[#022c22] transition-all cursor-pointer shadow-lg shadow-emerald-900/20">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "Add Faculty"}
                </button>
              </form>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-8 py-4">Faculty Name</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {faculties.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-700">{f.name}</td>
                      <td className="px-8 py-5 text-right"><button onClick={() => handleDeleteFaculty(f.id, f.name)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"><Trash2 size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ================= DEPARTMENTS TAB ================= */}
        {activeTab === "departments" && (
          <motion.div key="dept" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Register New Department</h3>
              <form onSubmit={handleAddDepartment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select required value={newDeptFacultyId} onChange={e => setNewDeptFacultyId(e.target.value)} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-inner">
                  <option value="">Select Faculty</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <input type="text" placeholder="Dept Code (CSE)" required value={newDeptCode} onChange={e => setNewDeptCode(e.target.value)} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 uppercase outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner" />
                <input type="text" placeholder="Full Dept Name" required value={newDeptName} onChange={e => setNewDeptName(e.target.value)} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner lg:col-span-1" />
                <button type="submit" disabled={isSubmitting} className="px-6 py-4 bg-[#064e3b] text-white font-bold rounded-2xl hover:bg-[#022c22] transition-all cursor-pointer shadow-lg shadow-emerald-900/20">Add Department</button>
              </form>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
               {/* Controls Bar for Departments */}
               <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 bg-slate-50">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                   <input type="text" placeholder="Search departments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                 </div>
                 <select value={filterDeptFaculty} onChange={e => setFilterDeptFaculty(e.target.value)} className="w-full sm:w-64 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 outline-none cursor-pointer">
                   <option value="">All Faculties</option>
                   {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                 </select>
               </div>

               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-8 py-4">Hierarchy</th><th className="px-8 py-4">Dept Name</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDepartments.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="text-slate-400">{d.faculties?.name}</span>
                            <ArrowRight size={12} className="text-slate-300" />
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{d.code}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 font-bold text-slate-700">{d.name}</td>
                        <td className="px-8 py-5 text-right"><button onClick={() => handleDeleteDepartment(d.id, d.code)} className="p-2.5 text-slate-300 hover:text-red-600 rounded-xl cursor-pointer transition-all"><Trash2 size={18} /></button></td>
                      </tr>
                    ))}
                    {filteredDepartments.length === 0 && <tr><td colSpan={3} className="px-8 py-10 text-center text-slate-400 font-bold">No departments found matching your criteria.</td></tr>}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}

        {/* ================= COURSES TAB ================= */}
        {activeTab === "courses" && (
          <motion.div key="course" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Register New Course</h3>
              <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select required value={newCourseDept} onChange={e => setNewCourseDept(e.target.value)} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-inner outline-none">
                  <option value="">Select Dept</option>
                  {departments.map(d => <option key={d.id} value={d.code}>{d.code}</option>)}
                </select>
                <select required value={newCourseSem} onChange={e => setNewCourseSem(e.target.value)} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-inner outline-none">
                  <option value="">Semester</option>
                  {semestersList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="text" placeholder="Course Code" required value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 uppercase shadow-inner" />
                <input type="text" placeholder="Course Name" required value={newCourseName} onChange={e => setNewCourseName(e.target.value)} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-inner" />
                <button type="submit" disabled={isSubmitting} className="md:col-span-4 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 cursor-pointer shadow-lg shadow-indigo-900/20">Add Course to Catalog</button>
              </form>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
               {/* Controls Bar for Courses */}
               <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                   <input type="text" placeholder="Search course name or code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 <div className="flex gap-2">
                   <select value={filterCourseDept} onChange={e => setFilterCourseDept(e.target.value)} className="w-full sm:w-40 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 outline-none cursor-pointer">
                     <option value="">All Depts</option>
                     {departments.map(d => <option key={d.id} value={d.code}>{d.code}</option>)}
                   </select>
                   <select value={filterCourseSem} onChange={e => setFilterCourseSem(e.target.value)} className="w-full sm:w-40 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 outline-none cursor-pointer">
                     <option value="">All Semesters</option>
                     {semestersList.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                 </div>
               </div>

               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-8 py-4">Dept</th><th className="px-8 py-4">Sem</th><th className="px-8 py-4">Code</th><th className="px-8 py-4">Course Name</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCourses.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-8 py-5 font-black text-indigo-700">{c.department_code}</td>
                        <td className="px-8 py-5 text-slate-500 font-bold">{c.semester}</td>
                        <td className="px-8 py-5 font-bold text-slate-800">{c.course_code}</td>
                        <td className="px-8 py-5 text-slate-600 font-medium">{c.course_name}</td>
                        <td className="px-8 py-5 text-right"><button onClick={() => handleDeleteCourse(c.id, c.course_code)} className="p-2.5 text-slate-300 hover:text-red-600 rounded-xl cursor-pointer transition-all"><Trash2 size={18} /></button></td>
                      </tr>
                    ))}
                    {filteredCourses.length === 0 && <tr><td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-bold">No courses found matching your criteria.</td></tr>}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}