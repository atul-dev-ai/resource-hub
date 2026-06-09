"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, CheckCircle, Clock, Eye, 
  ArrowRight, Download, FileType, CheckCircle2, Clock3, PlusCircle
} from "lucide-react";
import Link from "next/link";
import PremiumLoading from "@/components/PremiumLoading";
import { useQuery } from "@tanstack/react-query";
import { getStudentDashboardData } from "@/app/actions/studentActions";
import { useParams } from "next/navigation";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function StudentDashboard() {
  const params = useParams();
  const student_id = params?.student_id || '';
  const { data, isLoading: loading } = useQuery({
    queryKey: ["student_dashboard"],
    queryFn: getStudentDashboardData,
  });

  const userName = data?.userName || "Student";
  const userStats = data?.stats || { total: 0, approved: 0, pending: 0, views: 0 };
  const recentResources = data?.recentResources || [];

  if (loading) {
    return <PremiumLoading />;
  }

  // Map state to the UI stats structure
  const stats = [
    { title: "Total Uploads", count: userStats.total.toString(), icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Approved", count: userStats.approved.toString(), icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { title: "Pending", count: userStats.pending.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Total Views", count: userStats.views.toString(), icon: Eye, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
          <p className="text-emerald-100 max-w-xl text-sm sm:text-base">
            Ready to ace your next exam? Check out the latest resources uploaded by your peers or contribute to the community by uploading your own notes.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href={`/student-portal/${student_id}/upload`}>
              <button className="bg-white text-emerald-900 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-50 transition shadow-sm cursor-pointer">
                Upload Resource
              </button>
            </Link>
            <Link href={`/student-portal/${student_id}/resources`}>
              <button className="bg-emerald-500/30 text-white border border-emerald-400/30 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-500/50 transition backdrop-blur-sm cursor-pointer hidden sm:block">
                Browse All
              </button>
            </Link>
          </div>
        </div>
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.count}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Latest Resources Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Your Recent Uploads</h2>
          <Link href={`/student-portal/${student_id}/my-uploads`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="p-6 bg-slate-50/50">
          {recentResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recentResources.map((item: any) => {
                // File type detection
                const fileUrls = Array.isArray(item.file_urls) ? item.file_urls : [item.file_urls];
                const fileUrl = fileUrls[0] || "";
                const isPdf = fileUrl.toLowerCase().includes(".pdf");
                
                // Date formatting
                const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                });

                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${isPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        <FileType size={22} />
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : item.status === "rejected" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                            <Clock3 size={12} /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wider">
                            <Clock3 size={12} /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-6 mt-auto pt-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 uppercase">
                        {item.course_code || item.course_name || "N/A"}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        • {formattedDate}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                       <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          Action
                       </span>
                       <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex p-2 text-slate-400 hover:text-white bg-white hover:bg-emerald-600 border border-slate-200 hover:border-emerald-600 rounded-xl transition-all cursor-pointer shadow-sm group-hover:shadow-md"
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300">
              <FileText size={48} className="text-gray-300 mb-4" />
              <p className="font-bold text-gray-700 text-lg">You haven't uploaded any resources yet.</p>
              <Link href={`/student-portal/${student_id}/upload`} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mt-2 inline-flex items-center gap-1 transition-colors">
                <PlusCircle size={16} /> Click here to upload your first resource.
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}