"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Session and Role
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsLoggedIn(true);
        // Get user role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
          
        if (profile) {
          setUserRole(profile.role);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
            
          if (profile) setUserRole(profile.role);
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Function to determine correct dashboard link based on role
  const getDashboardLink = () => {
    if (!userRole) return "/login";
    
    // Check if role is admin-like
    if (['super_admin', 'admin', 'moderator'].includes(userRole)) {
      return "/admin-portal";
    }
    
    // Default fallback to student portal
    return "/student-portal";
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore / Resources", path: "/#resources" },
    { name: "Departments", path: "/#departments" },
    { name: "How it Works", path: "/#how-it-works" },
  ];

  return (
    <div className="fixed top-4 left-0 w-full z-50 flex justify-center px-4">
      <nav
        className={`w-full max-w-6xl transition-all duration-300 rounded-full border ${
          scrolled 
            ? "bg-green-700/80 backdrop-blur-md shadow-lg border-green-500/40 py-1" 
            : "bg-green-900/30 backdrop-blur-md border-transparent py-2"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white cursor-pointer">
              <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
              <span>Resource<span className="text-green-300">Hub</span></span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.path}
                className="relative text-green-50 hover:text-white font-medium transition-colors cursor-pointer group"
              >
                {link.name}
                <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-green-300 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}

            {/* Action Buttons (Dashboard / Login) */}
            <div className="flex items-center space-x-4 ml-4 border-l pl-4 border-green-400/30">
              {isLoggedIn ? (
                <Link href={getDashboardLink()}>
                  <button className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-400 transition duration-300 cursor-pointer font-bold text-sm shadow-md hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transform hover:-translate-y-0.5 border border-green-400/50">
                    <LayoutDashboard size={18} /> Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button className="flex items-center gap-2 bg-white text-green-700 px-5 py-2 rounded-full hover:bg-green-50 transition duration-300 cursor-pointer font-bold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    <LogIn size={18} /> Login / Signup
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-green-200 focus:outline-none cursor-pointer p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-20 left-4 right-4 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-50"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col space-y-2">
                {isLoggedIn ? (
                  <Link href={getDashboardLink()} onClick={() => setIsOpen(false)}>
                    <button className="w-full flex justify-center items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition duration-300 cursor-pointer font-medium">
                      <LayoutDashboard size={18} /> Go to Dashboard
                    </button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full flex justify-center items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition duration-300 cursor-pointer font-medium">
                      <LogIn size={18} /> Login / Signup
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>
    </div>
  );
}