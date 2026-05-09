"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle, Bug, FileWarning, HelpCircle, Lightbulb,
    Search, Filter, Loader2, CheckCircle2, Clock,
    ExternalLink, MessageSquare, Trash2, X
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logActivity } from "@/utils/logger";
import toast from "react-hot-toast";

export default function AdminReportsPage() {
    const supabase = createClient();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [selectedReport, setSelectedReport] = useState<any | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // FIX: Added email, department, and student_id to the fetch query
            const { data, error } = await supabase
                .from("reports")
                .select("*, profiles(full_name, email, department, student_id)") 
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Supabase Fetch Error:", error);
                throw error;
            }

            setReports(data || []);
        } catch (error: any) {
            toast.error("Failed to load reports. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const loadingToast = toast.loading(`Updating status to ${newStatus}...`);
        try {
            const { error } = await supabase.from("reports").update({ status: newStatus }).eq("id", id);
            if (error) throw error;

            setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
            if (selectedReport?.id === id) setSelectedReport({ ...selectedReport, status: newStatus });

            await logActivity("UPDATE_REPORT_STATUS", `Changed report ID: ${id} status to ${newStatus}`);
            toast.success("Status updated!", { id: loadingToast });
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (!window.confirm("Delete this report permanently?")) return;
        try {
            const { error } = await supabase.from("reports").delete().eq("id", id);
            if (error) throw error;
            setReports(reports.filter(r => r.id !== id));
            setSelectedReport(null);
            toast.success("Report deleted.");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.profiles?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        const matchesType = typeFilter === "all" || r.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusIcon = (status: string) => {
        if (status === 'resolved') return <CheckCircle2 size={16} className="text-emerald-500" />;
        if (status === 'investigating') return <Search size={16} className="text-blue-500" />;
        return <Clock size={16} className="text-orange-500" />;
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="space-y-6 relative">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Reports & Feedback</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Review system bugs, missing data alerts, and user suggestions.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-700">
                    <AlertCircle size={18} />
                    <span className="font-bold text-sm">{reports.filter(r => r.status === 'pending').length} Pending Tasks</span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text" placeholder="Search by title or student name..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium shadow-sm"
                    />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 cursor-pointer shadow-sm">
                    <option value="all">Status: All</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 cursor-pointer shadow-sm">
                    <option value="all">Type: All</option>
                    <option value="bug">System Bug</option>
                    <option value="missing_data">Missing Data</option>
                    <option value="content_error">Content Error</option>
                    <option value="feature_request">Feature Request</option>
                </select>
            </div>

            {/* Reports Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black border-b border-slate-200 tracking-widest">
                                <th className="px-6 py-4">Report Details</th>
                                <th className="px-6 py-4">Reporter</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium">
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-800 font-bold max-w-[300px] truncate">{report.title}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-black mt-0.5">{report.type.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 font-bold">{report.profiles?.full_name || "Unknown User"}</span>
                                            <span className="text-[11px] text-slate-400 font-medium">{report.profiles?.email || "No email"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(report.status)}
                                            <span className="capitalize text-xs font-bold text-slate-600">{report.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedReport(report)}
                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-sm border border-emerald-100"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredReports.length === 0 && <div className="p-20 text-center text-slate-400 font-bold">No reports found matching your filters.</div>}
                </div>
            </div>

            {/* Report Detail Modal */}
            <AnimatePresence>
                {selectedReport && (
                    /* FIX: z-[9999] added to ensure modal is always on top of navbar and sidebar */
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl"><MessageSquare size={20} /></div>
                                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Report Review</h3>
                                </div>
                                <button onClick={() => setSelectedReport(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"><X size={20} /></button>
                            </div>

                            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 leading-tight">{selectedReport.title}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded border border-slate-200">{selectedReport.type}</span>
                                        <span className="text-[11px] text-slate-400 font-bold uppercase">{new Date(selectedReport.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{selectedReport.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Reporter</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedReport.profiles?.full_name || "Unknown User"}</p>
                                        
                                        {/* FIX: Showing Email & Department gracefully */}
                                        {selectedReport.profiles?.email && (
                                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">{selectedReport.profiles.email}</p>
                                        )}
                                        {selectedReport.profiles?.department && (
                                            <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-1.5 py-0.5 rounded mt-1 border border-emerald-100">
                                                {selectedReport.profiles.department}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                                        <div className="flex items-center gap-2 capitalize font-bold text-slate-800 text-sm">
                                            {getStatusIcon(selectedReport.status)} {selectedReport.status}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
                                <button onClick={() => handleUpdateStatus(selectedReport.id, "investigating")} className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/10 cursor-pointer">Investigate</button>
                                <button onClick={() => handleUpdateStatus(selectedReport.id, "resolved")} className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 cursor-pointer">Mark Resolved</button>
                                <button onClick={() => handleDeleteReport(selectedReport.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 cursor-pointer"><Trash2 size={20} /></button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}