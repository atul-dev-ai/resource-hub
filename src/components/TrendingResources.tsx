"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, CheckCircle2, FileText, Download, Star, Loader2, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getApprovedResources } from "@/app/actions/resourceActions";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const tabs = [
  { id: "latest", label: "Latest Questions", icon: Clock },
  { id: "popular", label: "Popular Uploads", icon: TrendingUp },
  { id: "approved", label: "Recently Approved", icon: CheckCircle2 },
];

export default function TrendingResources() {
  const [activeTab, setActiveTab] = useState("latest");
  const router = useRouter();
  const supabase = createClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["approved_resources"],
    queryFn: getApprovedResources,
  });

  const trendingData = useMemo(() => {
    const latest = [...resources]
      .filter(r => /question|quiz|exam/i.test(r.resource_type || ""))
      .slice(0, 4);

    if (latest.length < 4) {
      const others = [...resources]
        .filter(r => !/question|quiz|exam/i.test(r.resource_type || ""))
        .slice(0, 4 - latest.length);
      latest.push(...others);
    }

    const popular = [...resources]
      .sort((a, b) => ((b.likes_count || 0) + (b.downloads_count || 0) + (b.views_count || 0)) - ((a.likes_count || 0) + (a.downloads_count || 0) + (a.views_count || 0)))
      .slice(0, 4);
    
    const approved = [...resources].slice(0, 4);

    return { latest, popular, approved } as Record<string, any[]>;
  }, [resources]);

  const handleAction = async (id: string, url: string, type: 'view' | 'download') => {
    try {
      const incrementField = type === 'view' ? 'views_count' : 'downloads_count';
      await supabase.rpc('increment_resource_stat', { row_id: id, field_name: incrementField });
    } catch (e) {
      console.error(e);
    }
    if (type === 'download') {
      window.open(url, "_blank");
    } else {
      router.push(`/resource/${id}`);
    }
  };

  return (
    <section className="w-full py-24 bg-green-800 border-t border-green-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            Trending & Latest
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-lg text-green-100 max-w-2xl mx-auto"
          >
            See what other students are sharing and downloading right now.
          </motion.p>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? "text-green-900 bg-white shadow-md transform -translate-y-0.5" 
                    : "text-green-100 bg-white/10 border border-white/20 hover:bg-white/20 hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-green-600" : "text-green-300"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-green-300">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p className="font-semibold">Loading trending resources...</p>
            </div>
          ) : trendingData[activeTab].length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-green-300/60 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <FileText size={48} className="mb-4 opacity-50" />
              <p className="font-semibold text-lg">No resources available yet.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {trendingData[activeTab].map((item, index) => {
                  const fileUrlsArray = Array.isArray(item.file_urls) ? item.file_urls : [item.file_urls];
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false, amount: 0.1 }}
                      transition={{ delay: index * 0.1 }}
                      key={item.id}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-sm hover:bg-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full text-white"
                    >
                      {/* Badge & Like Count */}
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <span className="inline-block px-2.5 py-1 bg-white/20 text-white text-xs font-bold rounded-md truncate max-w-[120px]">
                          {item.department || "N/A"}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded-md flex-shrink-0">
                          <Star size={12} className="fill-amber-300" />
                          {item.likes_count || 0}
                        </div>
                      </div>
                      
                      {/* Title & Icon */}
                      <div className="flex items-start gap-3 mb-4 flex-grow cursor-pointer" onClick={() => router.push(`/resource/${item.id}`)}>
                        <div className="p-2 bg-white/10 rounded-lg text-green-200 group-hover:text-white group-hover:bg-green-500/50 transition-colors flex-shrink-0">
                          <FileText size={20} />
                        </div>
                        <h3 className="font-bold text-white leading-snug line-clamp-2 group-hover:text-green-200 transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      {/* Footer (Type & Action) */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                        <span className="text-xs font-medium text-green-200 uppercase tracking-wider truncate max-w-[100px]">
                          {item.resource_type || "Document"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleAction(item.id, fileUrlsArray[0], 'view')}
                            className="text-blue-200 hover:text-white p-1.5 rounded-full hover:bg-blue-500/20 transition-colors"
                            title="View Resource"
                          >
                            <Eye size={18} />
                          </button>
                          {fileUrlsArray.map((url: string, idx: number) => (
                            <button 
                              key={idx}
                              onClick={() => handleAction(item.id, url, 'download')}
                              className="text-green-200 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors"
                              title={`Download File ${idx + 1}`}
                            >
                              <Download size={18} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 bg-white text-green-900 rounded-xl font-bold hover:bg-green-100 transition-colors shadow-sm transform hover:-translate-y-1 cursor-pointer"
          >
            Explore All Resources
          </button>
        </div>

      </div>
    </section>
  );
}
