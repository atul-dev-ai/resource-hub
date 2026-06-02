"use client";

import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { motion } from "framer-motion";
import { 
  Bug, FileWarning, HelpCircle, Lightbulb, 
  Send, Loader2, Clock, CheckCircle2, AlertCircle 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudentReports, invalidateStudentReports } from "@/app/actions/studentActions";

export default function StudentReportsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [userAuth, setUserAuth] = useState<any>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [type, setType] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const reportTypes = [
    { id: "bug", name: "System Bug / Glitch", icon: Bug },
    { id: "missing_data", name: "Missing Dept/Course/Session", icon: FileWarning },
    { id: "content_error", name: "Wrong Content / Bad File", icon: AlertCircle },
    { id: "feature_request", name: "Suggest a Feature", icon: Lightbulb },
    { id: "other", name: "Other Issue", icon: HelpCircle }
  ];

  const { data: myReportsData, isLoading: loading } = useQuery({
    queryKey: ["student_reports"],
    queryFn: getStudentReports,
  });

  const myReports = myReportsData || [];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserAuth(data?.user || null));
  }, []);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting your report...");

    try {
      if (!userAuth) throw new Error("Please log in again.");

      const { data, error } = await supabase.from("reports").insert([{
        reporter_id: userAuth.id,
        type,
        title,
        description,
        status: "pending"
      }]).select().single();

      if (error) throw error;

      setTitle(""); setDescription(""); setType("bug");
      
      await invalidateStudentReports(userAuth.id);
      queryClient.invalidateQueries({ queryKey: ["student_reports"] });
      
      toast.success("Report submitted successfully! Admins will review it soon.", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'resolved') return <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-black uppercase tracking-wider"><CheckCircle2 size={12}/> Resolved</span>;
    if (status === 'investigating') return <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-black uppercase tracking-wider"><Loader2 size={12} className="animate-spin"/> Investigating</span>;
    return <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-md text-[10px] font-black uppercase tracking-wider"><Clock size={12}/> Pending</span>;
  };

  const getTypeIcon = (typeId: string) => {
    const item = reportTypes.find(r => r.id === typeId);
    const Icon = item ? item.icon : HelpCircle;
    return <Icon size={16} className="text-slate-500" />;
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <AlertCircle className="text-[#5DCAA5]" size={28} /> Help & Feedback
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Found a bug or missing a department? Let us know so we can fix it.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ================= LEFT: SUBMIT REPORT FORM ================= */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
          <h2 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            Submit a Report
          </h2>
          
          <form onSubmit={handleSubmitReport} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Issue Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportTypes.map((rt) => (
                  <label key={rt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${type === rt.id ? 'border-[#5DCAA5] bg-[#5DCAA5]/10' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                    <input type="radio" name="reportType" value={rt.id} checked={type === rt.id} onChange={(e) => setType(e.target.value)} className="hidden" />
                    <rt.icon size={18} className={type === rt.id ? 'text-[#5DCAA5]' : 'text-slate-400'} />
                    <span className={`text-sm font-bold ${type === rt.id ? 'text-slate-800' : 'text-slate-600'}`}>{rt.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Report Title</label>
              <input 
                type="text" required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g., CIS Department is missing from the list"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5DCAA5] outline-none font-bold text-slate-700 transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Description</label>
              <textarea 
                required value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Please describe the issue or your suggestion in detail..." rows={5}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#5DCAA5] outline-none font-medium text-slate-600 resize-none transition-all" 
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#5DCAA5] text-[#1C1812] font-black py-4 rounded-2xl hover:bg-[#4eb390] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#5DCAA5]/20 disabled:opacity-70 mt-4 hover:-translate-y-1">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
              {isSubmitting ? "Submitting..." : "Send Report to Admins"}
            </button>
          </form>
        </div>

        {/* ================= RIGHT: MY REPORTS HISTORY ================= */}
        <div className="space-y-4">
          <h2 className="font-black text-slate-800 mb-4">My Past Reports</h2>
          
          {myReports.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center">
              <div className="p-4 bg-slate-100 rounded-full mb-3">
                <FileWarning className="text-slate-400" size={32} />
              </div>
              <h3 className="font-bold text-slate-700">No reports submitted</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">When you report an issue, you can track its status here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myReports.map((report) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={report.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {getTypeIcon(report.type)}
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm md:text-base">{report.title}</h3>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  <p className="text-sm text-slate-500 font-medium whitespace-pre-wrap leading-relaxed pl-12 border-l-2 border-transparent">
                    {report.description}
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Reported on {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}