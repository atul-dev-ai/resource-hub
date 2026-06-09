"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast"; 
import Image from "next/image";
import {
  Home, BookOpen, UploadCloud, Folder, Layers,
  Bookmark, Bell, User, Settings,
  Search, Menu, X, PlusCircle, ChevronLeft, ChevronRight, ChevronDown, LogOut, AlertTriangle, CalendarDays
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";

import { useParams } from "next/navigation";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string; student_id: string | null; avatar_url: string | null } | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const student_id = params?.student_id || '';
  const supabase = createClient();

  const menuItems = [
    { name: "Dashboard", path: `/student-portal/${student_id}`, icon: Home },
    { name: "Class Routine", path: `/student-portal/${student_id}/routine`, icon: CalendarDays },
    { name: "Resources", path: `/student-portal/${student_id}/resources`, icon: BookOpen },
    { name: "Upload", path: `/student-portal/${student_id}/upload`, icon: UploadCloud },
    { name: "My Uploads", path: `/student-portal/${student_id}/my-uploads`, icon: Folder },
    { name: "Reports", path: `/student-portal/${student_id}/reports`, icon: AlertTriangle},
  ];

  const bottomMenuItems = [
    { name: "Profile", path: `/student-portal/${student_id}/profile`, icon: User },
    { name: "Settings", path: `/student-portal/${student_id}/settings`, icon: Settings },
  ];

  // Fetch User Profile Data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, student_id")
          .eq("id", user.id)
          .single();
        if (data) setUserProfile(data);
      }
    };
    fetchUser();
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Toaster position="top-right" />

      {/* ================= LEFT SIDEBAR (DESKTOP) ================= */}
      {/* FIX: Added z-20 and relative positioning to properly layer the sidebar */}
      <aside 
        className={`hidden lg:flex flex-col bg-emerald-950 text-emerald-100 transition-all duration-300 relative z-20 m-4 rounded-[2rem] shadow-xl overflow-hidden h-[calc(100vh-2rem)] shrink-0 ${
          isMinimized ? "w-20" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-4 border-b border-emerald-900/50 overflow-hidden shrink-0 bg-emerald-900/20">
          <Link href="https://resource-hub-diu.vercel.app" className="text-2xl font-bold text-white cursor-pointer whitespace-nowrap">
            {isMinimized ? "R" : <>Resource<span className="text-emerald-400">Hub</span></>} 
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar overflow-x-hidden">
          
          {!isMinimized && (
            <p className="px-3 text-xs font-semibold text-emerald-500/80 uppercase tracking-wider mb-2 transition-opacity">Main Menu</p>
          )}
          
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path} title={isMinimized ? item.name : ""}>
                <div className={`flex items-center ${isMinimized ? "justify-center px-0" : "px-3"} py-2.5 rounded-xl mb-1 transition-colors cursor-pointer group ${
                  isActive ? "bg-emerald-800 text-white font-bold" : "text-emerald-100 hover:bg-emerald-900/50 hover:text-white font-medium"
                }`}>
                  <item.icon className={`w-5 h-5 ${isMinimized ? "" : "mr-3"} ${isActive ? "text-white" : "text-emerald-400 group-hover:text-emerald-300 shrink-0"}`} />
                  {!isMinimized && <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>}
                </div>
              </Link>
            );
          })}

          <div className="pt-6 pb-2">
            {!isMinimized && (
              <p className="px-3 text-xs font-semibold text-emerald-500/80 uppercase tracking-wider mb-2 transition-opacity">Account</p>
            )}
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path} title={isMinimized ? item.name : ""}>
                  <div className={`flex items-center ${isMinimized ? "justify-center px-0" : "px-3"} py-2.5 rounded-xl mb-1 transition-colors cursor-pointer group ${
                    isActive ? "bg-emerald-800 text-white font-bold" : "text-emerald-100 hover:bg-emerald-900/50 hover:text-white font-medium"
                  }`}>
                    <item.icon className={`w-5 h-5 ${isMinimized ? "" : "mr-3"} ${isActive ? "text-white" : "text-emerald-400 group-hover:text-emerald-300 shrink-0"}`} />
                    {!isMinimized && <span className="font-medium text-sm whitespace-nowrap">{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Minimize Button */}
        <div className="p-4 border-t border-emerald-900/50 flex justify-center shrink-0 bg-emerald-900/20">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className={`w-full flex items-center ${isMinimized ? "justify-center" : "px-4"} py-2.5 bg-emerald-900/40 text-emerald-300 rounded-xl hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer`}
            title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
          >
            {isMinimized ? (
              <ChevronRight size={20} />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft size={20} />
                <span className="font-bold text-sm">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR ================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
            />
            
            <motion.aside
              initial={{ x: "-120%" }} animate={{ x: 0 }} exit={{ x: "-120%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-emerald-950 text-emerald-100 flex flex-col shadow-2xl lg:hidden m-4 rounded-[2rem] h-[calc(100vh-2rem)] overflow-hidden"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-emerald-900/50 shrink-0 bg-emerald-900/20">
                <span className="text-2xl font-bold text-white">Resource<span className="text-emerald-400">Hub</span></span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-emerald-400 hover:bg-emerald-900/50 hover:text-white rounded-full cursor-pointer">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                <p className="px-3 text-xs font-semibold text-emerald-500/80 uppercase tracking-wider mb-2">Main Menu</p>
                {menuItems.map((item) => (
                  <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={`flex items-center px-3 py-3 rounded-xl mb-1 transition-colors cursor-pointer ${
                      pathname === item.path ? "bg-emerald-800 text-white font-bold" : "text-emerald-100 hover:bg-emerald-900/50 font-medium"
                    }`}>
                      <item.icon className={`w-5 h-5 mr-3 shrink-0 ${pathname === item.path ? "text-white" : "text-emerald-400"}`} />
                      {item.name}
                    </div>
                  </Link>
                ))}

                <div className="pt-6 pb-2">
                  <p className="px-3 text-xs font-semibold text-emerald-500/80 uppercase tracking-wider mb-2">Account</p>
                  {bottomMenuItems.map((item) => (
                    <Link key={item.name} href={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`flex items-center px-3 py-3 rounded-xl mb-1 transition-colors cursor-pointer ${
                        pathname === item.path ? "bg-emerald-800 text-white font-bold" : "text-emerald-100 hover:bg-emerald-900/50 font-medium"
                      }`}>
                        <item.icon className={`w-5 h-5 mr-3 shrink-0 ${pathname === item.path ? "text-white" : "text-emerald-400"}`} />
                        {item.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* TOPBAR */}
        {/* FIX: Changed z-10 to z-30 and added relative positioning */}
        <header className="h-16 bg-white border border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0 relative mt-4 mx-4 rounded-full shadow-sm">
          <div className="flex items-center flex-1 gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden cursor-pointer"
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden sm:flex max-w-md w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search resources, tags, or courses..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link 
              href={`/student-portal/${student_id}/upload`}
              className="hidden sm:flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition duration-300 font-medium text-sm shadow-sm cursor-pointer"
            >
              <PlusCircle size={18} />
              Quick Upload
            </Link>

            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                <div className="h-9 w-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center overflow-hidden relative shrink-0">
                  {userProfile?.avatar_url ? (
                    <Image src={userProfile.avatar_url} alt="Profile" fill className="object-cover" sizes="36px" />
                  ) : (
                    <span className="text-emerald-700 font-bold text-sm">
                      {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate leading-tight">
                      {userProfile?.full_name ? userProfile.full_name.split(' ')[0] : "Student"}
                    </span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                  </div>
                  {userProfile?.student_id && (
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider leading-tight">
                      {userProfile.student_id}
                    </span>
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1"
                    >
                      <Link href="/" onClick={() => setIsProfileOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                          <Home size={16} className="text-gray-400" /> Go to Home
                        </div>
                      </Link>
                      
                      <div className="h-px bg-gray-100 my-1"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut size={16} className="text-red-500" /> Log Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        {/* FIX: Removed relative and z-0 classes so modals inside children can cover the entire screen */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}