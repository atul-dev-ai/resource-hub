"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getApprovedResources } from "@/app/actions/resourceActions";
import { Award, Trophy, Medal, UploadCloud, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function TopContributors() {
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["approved_resources"],
    queryFn: getApprovedResources,
  });

  const topContributors = useMemo(() => {
    if (!resources || resources.length === 0) return [];

    const userMap: Record<string, any> = {};

    resources.forEach((res) => {
      if (!res.profiles || !res.profiles.id) return;
      const userId = res.profiles.id;
      
      if (!userMap[userId]) {
        userMap[userId] = {
          id: userId,
          full_name: res.profiles.full_name || "Unknown Contributor",
          department: res.profiles.department || "General",
          batch_initial: res.profiles.batch_initial || "N/A",
          avatar_url: res.profiles.avatar_url,
          uploadCount: 0,
        };
      }
      userMap[userId].uploadCount++;
    });

    return Object.values(userMap)
      .sort((a, b) => b.uploadCount - a.uploadCount)
      .slice(0, 3);
  }, [resources]);

  if (isLoading || topContributors.length === 0) {
    return null; // Do not render section if loading or no contributors
  }

  return (
    <section className="w-full py-24 bg-green-950 relative overflow-hidden border-t border-green-800">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-amber-400 rounded-2xl mb-4 border border-amber-500/20"
          >
            <Trophy size={28} />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            Top Contributors
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-lg text-green-200 max-w-2xl mx-auto"
          >
            A massive thank you to the students who share the most resources and help everyone succeed!
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Top 3 Contributors Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {topContributors.map((user, index) => {
              // Medal Colors
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              
              let medalColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
              if (isSecond) medalColor = "text-slate-300 bg-slate-400/10 border-slate-400/20";
              if (isThird) medalColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: index * 0.15 }}
                  className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 hover:bg-white/10 hover:border-green-500/30 transition-all duration-300 group flex flex-col items-center text-center shadow-xl relative overflow-hidden"
                >
                  {/* Rank Badge */}
                  <div className={`absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full border ${medalColor} backdrop-blur-md`}>
                    <span className="font-black text-lg">#{index + 1}</span>
                  </div>

                  {/* Avatar */}
                  <div className="relative mb-5 mt-2">
                    <div className="w-24 h-24 rounded-full bg-green-900 flex items-center justify-center overflow-hidden border-4 border-green-800 shadow-lg group-hover:border-green-500 transition-colors">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-black text-green-400 uppercase">
                          {user.full_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    {isFirst && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-amber-400">
                        <Award size={32} className="drop-shadow-lg" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <h3 className="font-bold text-xl text-white mb-1 group-hover:text-green-300 transition-colors">
                    {user.full_name}
                  </h3>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <span className="text-xs font-bold text-green-200 bg-green-900/50 px-2 py-1 rounded-md border border-green-700/50 truncate max-w-[120px]">
                      {user.department}
                    </span>
                    <span className="text-xs font-bold text-green-200 bg-green-900/50 px-2 py-1 rounded-md border border-green-700/50">
                      Batch {user.batch_initial}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="mt-auto w-full pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-green-100">
                    <UploadCloud size={18} className="text-green-400" />
                    <span className="font-black text-lg">{user.uploadCount}</span>
                    <span className="text-sm font-medium">Resources Shared</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Call to Action Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl p-8 border border-green-500/30 shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden"
          >
            {/* Decorative background circle */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-md shadow-inner">
              <GraduationCap size={32} />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-3">
              Join the Leaderboard!
            </h3>
            <p className="text-green-100 mb-8 font-medium leading-relaxed">
              Help your batchmates by sharing class notes, assignments, and previous question papers. Climb the ranks and become a Top Contributor!
            </p>
            
            <Link 
              href="/student-portal"
              className="w-full py-4 bg-white text-green-900 rounded-xl font-black hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Uploading <ChevronRight size={18} />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
