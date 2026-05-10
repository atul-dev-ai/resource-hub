"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { BookOpenText, UploadCloud, FileText, FileCheck, FileArchive } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const floatingVariants: Variants = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Hero() {
  // --- Auth States & Logic Start ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsLoggedIn(true);
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
  }, []);

  const getDashboardLink = () => {
    if (!userRole) return "/login";
    if (['super_admin', 'admin', 'moderator'].includes(userRole)) {
      return "/admin-portal";
    }
    return "/student-portal";
  };

  // Scroll Animations
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const y3 = useTransform(scrollY, [0, 500], [0, -80]);

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">

      {/* Background Image & Dark Green Overlay Section */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner-2.jpg"
          alt="Varsity Resource Hub Background"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={90}
        />
        {/* Vibrant Green Overlay */}
        <div className="absolute inset-0 bg-green-800/80 mix-blend-multiply"></div>
        {/* Subtle gradient for text contrast at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
      </div>

      {/* Floating Animated Icons */}
      <motion.div style={{ y: y1 }} className="absolute hidden md:block top-[20%] left-[12%] z-0 opacity-40">
        <motion.div variants={floatingVariants} animate="animate">
          <FileText size={32} className="text-green-300" />
        </motion.div>
      </motion.div>

      <motion.div style={{ y: y2 }} className="absolute hidden md:block top-[65%] left-[15%] z-0 opacity-30">
        <motion.div variants={floatingVariants} animate="animate" transition={{ delay: 1 }}>
          <FileCheck size={28} className="text-green-200" />
        </motion.div>
      </motion.div>

      <motion.div style={{ y: y3 }} className="absolute hidden md:block top-[25%] right-[12%] z-0 opacity-30">
        <motion.div variants={floatingVariants} animate="animate" transition={{ delay: 0.5 }}>
          <FileArchive size={36} className="text-green-400" />
        </motion.div>
      </motion.div>

      {/* Main Content (Text & Buttons) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-12">

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="flex flex-col items-center space-y-6 md:space-y-8"
        >
          {/* Badge / Small Intro */}
          <motion.div variants={itemVariants}>
            <span className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-200 border border-green-400/30 text-sm md:text-base animate-pulse font-medium backdrop-blur-sm">
              Knowledge Shared is Knowledge Multiplied
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight md:leading-tight"
          >
            Share Exam Questions <br className="hidden md:block" />
            <span className="text-green-300">& Help Others Succeed</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-300 max-w-2xl"
          >
            Access a community-driven database of past exam questions, assignments, and study materials to ace your courses.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto pt-4"
          >
            {/* Upload Now Button - Dynamic Routing */}
            <Link href={isLoggedIn ? getDashboardLink() : "/login"} className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg font-semibold text-lg hover:bg-green-400 transition duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transform hover:-translate-y-1 cursor-pointer">
                <UploadCloud size={22} />
                {isLoggedIn ? "Go to Dashboard" : "Upload Now"}
              </button>
            </Link>

            {/* Explore Questions Button - ID based scrolling */}
            <Link href="/#resources" className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-lg font-semibold text-lg backdrop-blur-md border border-white/20 hover:bg-white/20 transition duration-300 transform hover:-translate-y-1 cursor-pointer">
                <BookOpenText size={22} />
                Explore Questions
              </button>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}