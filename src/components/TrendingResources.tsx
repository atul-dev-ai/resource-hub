"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, CheckCircle2, FileText, Download, Star } from "lucide-react";

// Mock Data for Trending Section
const tabs = [
  { id: "latest", label: "Latest Questions", icon: Clock },
  { id: "popular", label: "Popular Uploads", icon: TrendingUp },
  { id: "approved", label: "Recently Approved", icon: CheckCircle2 },
];

const trendingData: Record<string, any[]> = {
  latest: [
    { id: 101, title: "Software Engineering Midterm 2024", dept: "SWE", type: "Question", likes: 12 },
    { id: 102, title: "Data Communication Final", dept: "CSE", type: "Question", likes: 5 },
    { id: 103, title: "Business Math Quiz 2", dept: "BBA", type: "Quiz", likes: 8 },
    { id: 104, title: "Electronic Devices Lab", dept: "EEE", type: "Question", likes: 2 },
  ],
  popular: [
    { id: 201, title: "Data Structures & Algorithms Complete Notes", dept: "CSE", type: "Study Notes", likes: 342 },
    { id: 202, title: "Microeconomics Final Suggestions 2023", dept: "BBA", type: "Suggestions", likes: 215 },
    { id: 203, title: "Database Management Systems Lab Manual", dept: "SWE", type: "Lab Material", likes: 189 },
    { id: 204, title: "Physics II Formula Sheet", dept: "EEE", type: "Cheat Sheet", likes: 156 },
  ],
  approved: [
    { id: 301, title: "Artificial Intelligence Assignment 1", dept: "Data Science / AI", type: "Assignment", likes: 24 },
    { id: 302, title: "Calculus I Midterm Solution", dept: "CSE", type: "Solution", likes: 45 },
    { id: 303, title: "Marketing Strategy Case Study", dept: "Marketing", type: "Case Study", likes: 33 },
    { id: 304, title: "Circuit Analysis Practice Problems", dept: "EEE", type: "Practice", likes: 19 },
  ],
};

export default function TrendingResources() {
  const [activeTab, setActiveTab] = useState("latest");

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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {trendingData[activeTab].map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ delay: index * 0.1 }}
                  key={item.id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-sm hover:bg-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full text-white"
                >
                  {/* Badge & Like Count */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-2.5 py-1 bg-white/20 text-white text-xs font-bold rounded-md">
                      {item.dept}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded-md">
                      <Star size={12} className="fill-amber-300" />
                      {item.likes}
                    </div>
                  </div>
                  
                  {/* Title & Icon */}
                  <div className="flex items-start gap-3 mb-4 flex-grow">
                    <div className="p-2 bg-white/10 rounded-lg text-green-200 group-hover:text-white group-hover:bg-green-500/50 transition-colors flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <h3 className="font-bold text-white leading-snug line-clamp-2 group-hover:text-green-200 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  {/* Footer (Type & Action) */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <span className="text-xs font-medium text-green-200 uppercase tracking-wider">
                      {item.type}
                    </span>
                    <button className="text-green-200 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-white text-green-900 rounded-xl font-bold hover:bg-green-100 transition-colors shadow-sm transform hover:-translate-y-1">
            Explore All Resources
          </button>
        </div>

      </div>
    </section>
  );
}
