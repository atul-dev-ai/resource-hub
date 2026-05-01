"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, FileText, Download, Tag, X } from "lucide-react";

// Mock Data for Resources
const resourceTypes = ["All", "Question Bank", "Assignments", "Notes", "Slides", "Lab Materials"];
const departments = ["All", "CSE", "SWE", "BBA", "EEE", "Law"];
const semesters = ["All", "Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5"];
const courses = ["All", "Structured Programming", "Discrete Math", "Data Structures", "Algorithms", "Database Systems"];
const fileTypes = ["All", "PDF", "Image", "Zip"];

const allResources = [
  { id: 1, title: "Discrete Math Midterm 2023", type: "Question Bank", dept: "CSE", sem: "Semester 3", course: "Discrete Math", fileType: "PDF", size: "1.2 MB", tags: ["midterm", "important"] },
  { id: 2, title: "Data Structures Complete Notes", type: "Notes", dept: "SWE", sem: "Semester 3", course: "Data Structures", fileType: "PDF", size: "4.5 MB", tags: ["final", "handwritten"] },
  { id: 3, title: "Structured Programming Lab Task 4", type: "Lab Materials", dept: "CSE", sem: "Semester 1", course: "Structured Programming", fileType: "Zip", size: "2.1 MB", tags: ["lab"] },
  { id: 4, title: "Business Communication Slides", type: "Slides", dept: "BBA", sem: "Semester 2", course: "Business Comm", fileType: "PDF", size: "8.3 MB", tags: ["slides"] },
  { id: 5, title: "Algorithms Final 2022", type: "Question Bank", dept: "CSE", sem: "Semester 4", course: "Algorithms", fileType: "Image", size: "500 KB", tags: ["final", "previous-year"] },
  { id: 6, title: "Database Normalization Assignment", type: "Assignments", dept: "SWE", sem: "Semester 4", course: "Database Systems", fileType: "PDF", size: "1.5 MB", tags: ["solved"] },
];

export default function ResourcesSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedSem, setSelectedSem] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedFileType, setSelectedFileType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Filter Logic
  const filteredResources = allResources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "All" || res.type === selectedType;
    const matchesDept = selectedDept === "All" || res.dept === selectedDept;
    const matchesSem = selectedSem === "All" || res.sem === selectedSem;
    const matchesCourse = selectedCourse === "All" || res.course === selectedCourse;
    const matchesFileType = selectedFileType === "All" || res.fileType === selectedFileType;

    return matchesSearch && matchesType && matchesDept && matchesSem && matchesCourse && matchesFileType;
  });

  return (
    <section id="resources" className="w-full py-24 bg-green-950 relative border-b border-green-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            Find Any Resource
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-lg text-green-200 max-w-2xl mx-auto"
          >
            Search across all question banks, assignments, notes, and lab materials.
          </motion.p>
        </div>

        {/* Global Search & Filter Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-green-400" />
            </div>
            <input
              type="text"
              placeholder="Search e.g. 'Discrete Math question pdf' or '#midterm'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-green-700/50 rounded-2xl text-white placeholder-green-400/70 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/15 transition-all shadow-inner backdrop-blur-sm text-lg"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all shadow-md md:w-auto w-full ${showFilters ? 'bg-green-600 text-white border-green-500' : 'bg-white/10 text-green-100 border border-green-700/50 hover:bg-white/20'}`}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-green-900/40 border border-green-700/50 backdrop-blur-md rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 shadow-lg">
                
                {/* Content Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">Type</label>
                  <select 
                    value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-green-500 appearance-none"
                  >
                    {resourceTypes.map(t => <option key={t} value={t} className="bg-green-900">{t}</option>)}
                  </select>
                </div>

                {/* Department */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">Department</label>
                  <select 
                    value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-green-500 appearance-none"
                  >
                    {departments.map(d => <option key={d} value={d} className="bg-green-900">{d}</option>)}
                  </select>
                </div>

                {/* Semester */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">Semester</label>
                  <select 
                    value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)}
                    className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-green-500 appearance-none"
                  >
                    {semesters.map(s => <option key={s} value={s} className="bg-green-900">{s}</option>)}
                  </select>
                </div>

                {/* Course */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">Course</label>
                  <select 
                    value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-green-500 appearance-none"
                  >
                    {courses.map(c => <option key={c} value={c} className="bg-green-900">{c}</option>)}
                  </select>
                </div>

                {/* File Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">File Type</label>
                  <select 
                    value={selectedFileType} onChange={(e) => setSelectedFileType(e.target.value)}
                    className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-green-500 appearance-none"
                  >
                    {fileTypes.map(f => <option key={f} value={f} className="bg-green-900">{f}</option>)}
                  </select>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredResources.length > 0 ? (
              filteredResources.map((resource, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={resource.id}
                  className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <div className="flex-grow">
                      <span className="inline-block px-2.5 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-md mb-2">
                        {resource.type}
                      </span>
                      <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-green-300 transition-colors">
                        {resource.title}
                      </h3>
                    </div>
                    <div className="p-2.5 bg-black/20 rounded-xl text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                      {resource.fileType === "PDF" ? <FileText size={24} /> : <BookOpen size={24} />}
                    </div>
                  </div>

                  {/* Metadata tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded-md">{resource.dept}</span>
                    <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded-md">{resource.sem}</span>
                    <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded-md line-clamp-1 max-w-[120px]" title={resource.course}>{resource.course}</span>
                  </div>

                  {/* Spacer to push tags/footer down */}
                  <div className="mt-auto flex flex-col gap-4">
                    {/* Tags */}
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {resource.tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 text-[10px] font-medium text-green-200 bg-green-900/60 px-2 py-1 rounded-full border border-green-700/50">
                            <Tag size={10} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                        <span className="uppercase">{resource.fileType}</span>
                        <span>•</span>
                        <span>{resource.size}</span>
                      </div>
                      <button className="flex items-center justify-center p-2 rounded-full bg-green-600/20 text-green-400 hover:bg-green-500 hover:text-white transition-all">
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center flex flex-col items-center justify-center text-green-200/60"
              >
                <Search size={48} className="mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No resources found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setSearchTerm(""); setSelectedType("All"); setSelectedDept("All"); setSelectedSem("All"); setSelectedCourse("All"); setSelectedFileType("All");
                  }}
                  className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
