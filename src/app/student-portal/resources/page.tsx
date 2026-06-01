"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Eye, Download, FileType, Loader2, X, 
  BookOpen, Hash, Calendar, Layers, User 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { getApprovedResources } from "@/app/actions/resourceActions";

export default function ResourcesPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const departments = ["All", "CSE", "SWE", "CIS", "EEE", "BBA", "ENG", "PHR", "LAW"];

  const { data: allResources = [], isLoading: loading } = useQuery({
    queryKey: ["approved_resources"],
    queryFn: getApprovedResources,
  });

  const resources = selectedDept === "All" ? allResources : allResources.filter(r => r.department === selectedDept);

  // Search Logic
  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Resources</h1>
          <p className="text-gray-500 mt-1">Access question papers, notes, and materials from all departments.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title, course, or code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer font-bold text-gray-700 text-sm"
          >
            {departments.map(dept => <option key={dept} value={dept}>{dept} Department</option>)}
          </select>
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <motion.div 
              key={res.id}
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group"
            >
              {/* Card Header: Badge & Icon */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileType size={24} />
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase rounded-full tracking-widest">
                  {res.resource_type}
                </span>
              </div>

              {/* Title & Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 min-h-[3.5rem]">
                  {res.title}
                </h3>
                
                <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <Hash size={14} className="text-blue-500" /> {res.course_code}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <Layers size={14} className="text-indigo-500" /> {res.semester}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <Calendar size={14} className="text-orange-500" /> {res.session_year}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <User size={14} className="text-green-500" /> {res.profiles?.full_name?.split(' ')[0] || "Student"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex gap-3">
                <button 
                  onClick={() => setPreviewUrl(res.file_urls?.[0])}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors cursor-pointer"
                >
                  <Eye size={16} /> Preview
                </button>
                <a 
                  href={res.file_urls?.[0]} 
                  download 
                  className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Download size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No Resources Found</h3>
          <p className="text-gray-500">Try adjusting your search or department filter.</p>
        </div>
      )}

      {/* FULL SCREEN MODAL PREVIEW */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileType size={18} className="text-blue-600" /> Document Preview
                </h3>
                <button onClick={() => setPreviewUrl(null)} className="p-2 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full transition-all cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 bg-gray-100">
                <iframe src={previewUrl} className="w-full h-full border-none" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}