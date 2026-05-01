"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, BookOpen, FileText, Download, Folder, Layers } from "lucide-react";

// Academic Hierarchy Data
const faculties = [
  {
    name: "Faculty of Science & Information Technology",
    departments: ["Computer Science & Engineering (CSE)", "Software Engineering (SWE)", "Data Science / AI"],
  },
  {
    name: "Faculty of Business & Entrepreneurship",
    departments: ["Business Administration (BBA)", "Management", "Finance & Banking"],
  },
  {
    name: "Faculty of Engineering",
    departments: ["Electrical & Electronic Engineering (EEE)", "Civil Engineering (CE)", "Architecture"],
  },
];

// Mock Structure: Department -> Semesters -> Courses -> Materials
const mockSemesters = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];

const mockCourses: Record<string, string[]> = {
  "Semester 1": ["Introduction to Programming", "English I", "Physics I"],
  "Semester 2": ["Structured Programming", "Math II", "Physics II"],
  "Semester 3": ["Discrete Math", "Data Structures", "Object Oriented Programming"],
  "Semester 4": ["Algorithms", "Database Management Systems", "Software Engineering"],
};

// Generic mock materials for any course
const mockMaterials = [
  { id: 1, title: "Midterm Question 2023", type: "Question Bank", size: "1.2 MB", fileType: "PDF" },
  { id: 2, title: "Final Question 2022", type: "Question Bank", size: "2.5 MB", fileType: "PDF" },
  { id: 3, title: "Class Lecture Notes (Complete)", type: "Notes", size: "12.4 MB", fileType: "PDF" },
  { id: 4, title: "Lab Task 1 to 5 Solutions", type: "Lab Materials", size: "4.1 MB", fileType: "Zip" },
  { id: 5, title: "Chapter 1-3 Presentation", type: "Slides", size: "5.5 MB", fileType: "PPT" },
  { id: 6, title: "Assignment 1 Guidelines", type: "Assignments", size: "0.5 MB", fileType: "PDF" },
];

export default function DepartmentsSection() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedSem, setSelectedSem] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Handlers for navigation
  const handleBackToDepts = () => {
    setSelectedDept(null);
    setSelectedSem(null);
    setSelectedCourse(null);
  };

  const handleBackToSemesters = () => {
    setSelectedCourse(null);
  };

  // Group materials by type for the selected course
  const groupedMaterials = mockMaterials.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, typeof mockMaterials>);

  return (
    <section id="departments" className="w-full py-24 bg-green-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              className="text-3xl font-extrabold text-white sm:text-4xl"
            >
              Academic Departments
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-lg text-green-100 max-w-2xl"
            >
              Browse materials strictly by your academic curriculum.
            </motion.p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!selectedDept ? (
            /* LEVEL 1: DEPARTMENT GRID VIEW */
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden"
            >
              {faculties.map((faculty, fIndex) => (
                <motion.div 
                  key={faculty.name}
                  initial={{ opacity: 0, x: fIndex % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: (fIndex % 3) * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col h-full text-white hover:bg-white/15 transition-colors"
                >
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-white/20 text-green-100">
                      Faculty
                    </span>
                    <h3 className="text-xl font-bold leading-tight text-white">{faculty.name}</h3>
                  </div>
                  
                  <ul className="space-y-3 mt-auto flex-grow">
                    {faculty.departments.map((dept) => (
                      <li key={dept}>
                        <button 
                          onClick={() => setSelectedDept(dept)}
                          className="w-full text-left flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/20 border border-transparent hover:border-white/20 transition-all duration-200 group"
                        >
                          <span className="font-medium text-sm text-green-50">{dept}</span>
                          <ChevronRight size={16} className="text-green-300 group-hover:text-white transform group-hover:translate-x-1 transition-transform" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* LEVEL 2 & 3: STRUCTURED BROWSING (SIDEBAR + MAIN) */
            <motion.div 
              key="structure"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
            >
              {/* SIDEBAR: Semesters */}
              <div className="w-full md:w-64 bg-green-950/50 border-r border-white/10 p-6 flex flex-col">
                <button 
                  onClick={handleBackToDepts}
                  className="flex items-center gap-2 text-green-300 hover:text-white mb-8 transition-colors text-sm font-semibold w-fit"
                >
                  <ArrowLeft size={16} /> Back to Faculties
                </button>

                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                  <Layers size={18} className="text-green-400" /> Semesters
                </h3>

                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                  {mockSemesters.map((sem) => (
                    <button
                      key={sem}
                      onClick={() => { setSelectedSem(sem); setSelectedCourse(null); }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium flex justify-between items-center ${
                        selectedSem === sem 
                          ? "bg-green-600 text-white shadow-md border border-green-500" 
                          : "text-green-100 hover:bg-white/10 border border-transparent"
                      }`}
                    >
                      {sem}
                      {selectedSem === sem && <ChevronRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="flex-grow p-6 md:p-10 flex flex-col bg-gradient-to-br from-transparent to-black/10">
                {/* Header for Main Area */}
                <div className="mb-8 pb-6 border-b border-white/10 flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-white/10 rounded-md text-xs font-bold text-green-200 uppercase">{selectedDept}</span>
                  {selectedSem && <span className="text-green-400 font-bold px-1">/</span>}
                  {selectedSem && <span className="px-3 py-1 bg-green-800 rounded-md text-xs font-bold text-white uppercase">{selectedSem}</span>}
                  {selectedCourse && <span className="text-green-400 font-bold px-1">/</span>}
                  {selectedCourse && <span className="px-3 py-1 bg-green-600 rounded-md text-xs font-bold text-white uppercase">{selectedCourse}</span>}
                </div>

                {!selectedSem ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-green-200/50">
                    <Folder size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">Select a semester from the sidebar.</p>
                  </div>
                ) : !selectedCourse ? (
                  /* COURSE LIST FOR SELECTED SEMESTER */
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-white mb-6">Courses for {selectedSem}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(mockCourses[selectedSem] || []).map((course, i) => (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={course}
                          onClick={() => setSelectedCourse(course)}
                          className="flex items-center justify-between p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-green-500/50 transition-all text-left group shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-green-500/20 text-green-300 group-hover:bg-green-500 group-hover:text-white transition-colors">
                              <BookOpen size={20} />
                            </div>
                            <span className="font-semibold text-white">{course}</span>
                          </div>
                          <ChevronRight size={18} className="text-green-400 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </motion.button>
                      ))}
                      {(mockCourses[selectedSem] || []).length === 0 && (
                        <p className="text-green-200/50 col-span-2">No courses found for this semester.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* MATERIALS LIST FOR SELECTED COURSE */
                  <div className="flex-grow flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-white">{selectedCourse} Materials</h3>
                      <button 
                        onClick={handleBackToSemesters}
                        className="text-sm font-medium text-green-300 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <ArrowLeft size={14} /> Back to Courses
                      </button>
                    </div>

                    <div className="space-y-8">
                      {Object.entries(groupedMaterials).map(([type, materials], groupIdx) => (
                        <motion.div 
                          key={type}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIdx * 0.1 }}
                        >
                          <h4 className="text-green-300 font-semibold mb-4 uppercase tracking-wider text-sm flex items-center gap-2 border-b border-green-800 pb-2">
                            {type}
                            <span className="bg-green-800/50 text-white text-xs px-2 py-0.5 rounded-full">{materials.length}</span>
                          </h4>
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            {materials.map((mat) => (
                              <div key={mat.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-3">
                                  <FileText size={18} className="text-green-400" />
                                  <div>
                                    <h5 className="font-medium text-white text-sm line-clamp-1">{mat.title}</h5>
                                    <span className="text-xs text-gray-400">{mat.fileType} • {mat.size}</span>
                                  </div>
                                </div>
                                <button className="p-2 text-green-400 hover:text-white bg-green-500/10 hover:bg-green-500/30 rounded-lg transition-colors">
                                  <Download size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
