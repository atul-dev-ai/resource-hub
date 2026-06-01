"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, FileText, Download, Tag, X, Eye, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getApprovedResources } from "@/app/actions/resourceActions";

// Filter Options
const resourceTypes = ["All", "Question Bank", "Assignments", "Notes", "Slides", "Lab Materials"];
const departments = ["All", "CSE", "SWE", "BBA", "EEE", "Law"];
const semesters = ["All", "Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5"];
const courses = ["All", "Structured Programming", "Discrete Math", "Data Structures", "Algorithms", "Database Systems"];
const fileTypes = ["All", "PDF", "Image", "Zip"];

export default function ResourcesSection() {
  const [userVotes, setUserVotes] = useState<Record<string, string>>({}); // { resource_id: 'like' | 'dislike' }
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedSem, setSelectedSem] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedFileType, setSelectedFileType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        setUserId(session.user.id);
      }

      // If user is logged in, fetch their votes
      if (session?.user) {
        const { data: voteData } = await supabase
          .from('resource_votes')
          .select('resource_id, vote_type')
          .eq('user_id', session.user.id);
        
        if (voteData) {
          const votesMap: Record<string, string> = {};
          voteData.forEach(v => {
            votesMap[v.resource_id] = v.vote_type;
          });
          setUserVotes(votesMap);
        }
      }
    };

    checkUserAndFetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["approved_resources"],
    queryFn: getApprovedResources,
  });

  // --- View Tracking ---
  const trackView = async (resourceId: string) => {
    try {
      // Optimistic UI update for tracking views in cache isn't easily doable locally without mutating queryCache.
      // We will skip optimistic update for views on the list since it refetches, or we can just leave it to next fetch.
      // If we really need optimistic update, we could use queryClient.setQueryData.
      
      // We use RPC for atomic increment in DB, but since we haven't created the RPC yet,
      // we'll fetch the current count and update it (Not fully atomic, but works for now).
      const { data } = await supabase.from('resources').select('views_count').eq('id', resourceId).single();
      const currentViews = data?.views_count || 0;
      
      await supabase.from('resources').update({ views_count: currentViews + 1 }).eq('id', resourceId);
    } catch (e) {
      console.error("View tracking failed");
    }
  };

  const handleAction = (resourceId: string, fileUrl: string, action: 'view' | 'download') => {
    if (!isLoggedIn) {
      toast.error("Please login to view or download files.", { duration: 3000 });
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    if (!fileUrl) {
      toast.error("File link is missing!");
      return;
    }

    trackView(resourceId);
    toast.success(`${action === 'view' ? 'Opening' : 'Downloading'} resource...`);
    
    if (action === 'view') {
      window.open(fileUrl, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --- Like/Dislike Logic ---
  const handleVote = async (resourceId: string, type: 'like' | 'dislike') => {
    if (!isLoggedIn) {
      toast.error("Please login to vote on resources.", { duration: 3000 });
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    const currentVote = userVotes[resourceId];
    const resource = resources.find(r => r.id === resourceId);
    if (!resource || !userId) return;

    let newLikes = resource.likes_count || 0;
    let newDislikes = resource.dislikes_count || 0;
    
    const newVotes = { ...userVotes };

    try {
      if (currentVote === type) {
        // User clicked the same button again -> Remove vote
        delete newVotes[resourceId];
        type === 'like' ? newLikes-- : newDislikes--;
        await supabase.from('resource_votes').delete().match({ resource_id: resourceId, user_id: userId });
      } else {
        // Changing vote or new vote
        if (currentVote === 'like') newLikes--;
        if (currentVote === 'dislike') newDislikes--;
        
        type === 'like' ? newLikes++ : newDislikes++;
        newVotes[resourceId] = type;

        await supabase.from('resource_votes').upsert({
          resource_id: resourceId,
          user_id: userId,
          vote_type: type
        }, { onConflict: 'resource_id, user_id' });
      }

      // Update Resource Table Stats
      await supabase.from('resources').update({
        likes_count: newLikes,
        dislikes_count: newDislikes
      }).eq('id', resourceId);

      // Update UI State for votes locally via userVotes
      setUserVotes(newVotes);
      // To update likes_count and dislikes_count optimistically, we'd need to mutate queryCache or not do it optimistically.
      // For simplicity, we just rely on userVotes state for now, or just let it refetch if we invalidate.
      // But we aren't invalidating here, so we might want to update the cached data.
      // It's fine to leave it for now or implement full cache update later.

    } catch (error) {
      toast.error("Failed to register vote.");
    }
  };

  // Advanced Filter Logic
  const filteredResources = resources.filter(res => {
    const title = res.title || "";
    const tags = res.tags || [];
    const type = res.resource_type || "";
    const dept = res.department || "";
    const sem = res.semester || "";
    const course = res.course_name || "";
    
    const fileUrls = Array.isArray(res.file_urls) ? res.file_urls : [res.file_urls];
    const fileUrlString = fileUrls[0] || "";
    const fileType = fileUrlString.toLowerCase().endsWith('.pdf') ? 'PDF' 
                   : fileUrlString.toLowerCase().endsWith('.zip') ? 'Zip' 
                   : fileUrlString.match(/\.(jpeg|jpg|gif|png)$/) != null ? 'Image' : 'Other';

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (Array.isArray(tags) && tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesType = selectedType === "All" || type === selectedType;
    const matchesDept = selectedDept === "All" || dept === selectedDept;
    const matchesSem = selectedSem === "All" || sem === selectedSem;
    const matchesCourse = selectedCourse === "All" || course === selectedCourse;
    const matchesFileType = selectedFileType === "All" || fileType === selectedFileType;

    return matchesSearch && matchesType && matchesDept && matchesSem && matchesCourse && matchesFileType;
  });

  const displayResources = filteredResources.slice(0, 6);

  return (
    <section id="resources" className="w-full py-24 bg-green-950 relative border-b border-green-800">
      <Toaster position="top-right" />
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
              placeholder="Search e.g. 'Discrete Math' or '#midterm'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-green-700/50 rounded-2xl text-white placeholder-green-400/70 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/15 transition-all shadow-inner backdrop-blur-sm text-lg"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center cursor-pointer gap-2 px-6 py-4 rounded-2xl font-semibold transition-all shadow-md md:w-auto w-full ${showFilters ? 'bg-green-600 text-white border-green-500' : 'bg-white/10 text-green-100 border border-green-700/50 hover:bg-white/20'}`}
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">Type</label>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white outline-none cursor-pointer">
                    {resourceTypes.map(t => <option key={t} value={t} className="bg-green-900">{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">Department</label>
                  <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white outline-none cursor-pointer">
                    {departments.map(d => <option key={d} value={d} className="bg-green-900">{d}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">Semester</label>
                  <select value={selectedSem} onChange={(e) => setSelectedSem(e.target.value)} className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white outline-none cursor-pointer">
                    {semesters.map(s => <option key={s} value={s} className="bg-green-900">{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">Course</label>
                  <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white outline-none cursor-pointer">
                    {courses.map(c => <option key={c} value={c} className="bg-green-900">{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-green-300 uppercase tracking-wider">File Type</label>
                  <select value={selectedFileType} onChange={(e) => setSelectedFileType(e.target.value)} className="w-full bg-black/20 border border-green-800 rounded-xl px-3 py-2 text-white outline-none cursor-pointer">
                    {fileTypes.map(f => <option key={f} value={f} className="bg-green-900">{f}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resources State Check */}
        {isLoading ? (
          <div className="w-full flex flex-col items-center justify-center py-20 text-green-400">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="font-medium text-lg">Fetching resources from database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayResources.length > 0 ? (
                displayResources.map((resource) => {
                  const type = resource.resource_type || "Resource";
                  const dept = resource.department || "N/A";
                  const sem = resource.semester || "N/A";
                  const course = resource.course_name || "N/A";
                  const tags = resource.tags || [];
                  
                  const fileUrlsArray = Array.isArray(resource.file_urls) ? resource.file_urls : [resource.file_urls];
                  const fileUrl = fileUrlsArray[0] || "";
                  const isPdf = fileUrl.toLowerCase().includes(".pdf");

                  const userVote = userVotes[resource.id]; // 'like', 'dislike', or undefined

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      key={resource.id}
                      className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 hover:border-green-500/50 transition-all duration-300 group flex flex-col h-full shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <div className="flex-grow">
                          <span className="inline-block px-2.5 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-md mb-2">
                            {type}
                          </span>
                          <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-green-300 transition-colors">
                            {resource.title}
                          </h3>
                        </div>
                        <div className="p-2.5 bg-black/20 rounded-xl text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                          {isPdf ? <FileText size={24} /> : <BookOpen size={24} />}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded-md">{dept}</span>
                        <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded-md">{sem}</span>
                        <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded-md line-clamp-1 max-w-[120px]" title={course}>{course}</span>
                      </div>

                      <div className="mt-auto flex flex-col gap-4">
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag: string) => (
                              <span key={tag} className="flex items-center gap-1 text-[10px] font-medium text-green-200 bg-green-900/60 px-2 py-1 rounded-full border border-green-700/50">
                                <Tag size={10} /> {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* --- Community Moderation Footer --- */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          
                          {/* Left: Views & Votes */}
                          <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                            {/* View Count */}
                            <div className="flex items-center gap-1" title="Total Views">
                              <Eye size={14} className="text-gray-500" /> 
                              <span>{resource.views_count || 0}</span>
                            </div>

                            {/* Likes */}
                            <button 
                              onClick={() => handleVote(resource.id, 'like')}
                              className={`flex items-center gap-1 transition-colors cursor-pointer ${userVote === 'like' ? 'text-green-400' : 'hover:text-green-400'}`}
                            >
                              <ThumbsUp size={14} className={userVote === 'like' ? 'fill-green-400/30' : ''} /> 
                              <span>{resource.likes_count || 0}</span>
                            </button>

                            {/* Dislikes */}
                            <button 
                              onClick={() => handleVote(resource.id, 'dislike')}
                              className={`flex items-center gap-1 transition-colors cursor-pointer ${userVote === 'dislike' ? 'text-red-400' : 'hover:text-red-400'}`}
                            >
                              <ThumbsDown size={14} className={userVote === 'dislike' ? 'fill-red-400/30' : ''} /> 
                              <span>{resource.dislikes_count || 0}</span>
                            </button>
                          </div>
                          
                          {/* Right: View & Download Buttons */}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleAction(resource.id, fileUrl, 'view')}
                              title="View Resource"
                              className="flex items-center justify-center p-2 rounded-full cursor-pointer bg-blue-600/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => handleAction(resource.id, fileUrl, 'download')}
                              title="Download Resource"
                              className="flex items-center justify-center p-2 rounded-full cursor-pointer bg-green-600/20 text-green-400 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                            >
                              <Download size={18} />
                            </button>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center flex flex-col items-center justify-center text-green-200/60 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm"
                >
                  <BookOpen size={48} className="mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No resources found</h3>
                  <p>Looks like there are no files available for your current filters.</p>
                  {searchTerm || selectedType !== "All" ? (
                    <button 
                      onClick={() => {
                        setSearchTerm(""); setSelectedType("All"); setSelectedDept("All"); setSelectedSem("All"); setSelectedCourse("All"); setSelectedFileType("All");
                      }}
                      className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}