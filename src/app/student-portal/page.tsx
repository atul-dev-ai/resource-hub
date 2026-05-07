"use client";

import { motion } from "framer-motion";
import { 
  FileText, CheckCircle, Clock, Eye, 
  ArrowRight, Download, FileType, CheckCircle2, Clock3 
} from "lucide-react";
import Link from "next/link";

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

// Dummy Data (Database add hole egula dynamic hobe)
const stats = [
  { title: "Total Uploads", count: "24", icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Approved", count: "18", icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  { title: "Pending", count: "6", icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
  { title: "Total Views", count: "342", icon: Eye, color: "text-purple-600", bg: "bg-purple-100" },
];

const recentResources = [
  { id: 1, title: "Discrete Math Final Question 2025", type: "PDF", course: "CSE214", date: "2 days ago", status: "Approved" },
  { id: 2, title: "Data Structure Lab Manual", type: "PDF", course: "CSE221", date: "5 days ago", status: "Approved" },
  { id: 3, title: "Algorithm Midterm Handnote", type: "Image", course: "CSE222", date: "1 week ago", status: "Pending" },
  { id: 4, title: "Software Engineering Slides", type: "PDF", course: "SWE311", date: "2 weeks ago", status: "Approved" },
];

export default function StudentDashboard() {
  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, Student! 👋</h1>
          <p className="text-blue-100 max-w-xl text-sm sm:text-base">
            Ready to ace your next exam? Check out the latest resources uploaded by your peers or contribute to the community by uploading your own notes.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href="/student-portal/upload">
              <button className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition shadow-sm cursor-pointer">
                Upload Resource
              </button>
            </Link>
            <Link href="/student-portal/resources">
              <button className="bg-blue-500/30 text-white border border-blue-400/30 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-500/50 transition backdrop-blur-sm cursor-pointer hidden sm:block">
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
          <h2 className="text-lg font-bold text-gray-800">Latest Resources</h2>
          <Link href="/student-portal/resources" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Resource Name</th>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium hidden sm:table-cell">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentResources.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.type === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        <FileType size={18} />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.course}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                    {item.date}
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "Approved" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={14} /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        <Clock3 size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer shadow-sm">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}