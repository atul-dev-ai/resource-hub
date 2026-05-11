"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function PremiumLoading() {
  const [loadingText, setLoadingText] = useState("Authenticating session...");

  useEffect(() => {
    const texts = [
      "Authenticating session...",
      "Securing connection...",
      "Fetching your resources...",
      "Preparing dashboard..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] min-h-screen bg-[#36312a] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1812] to-transparent opacity-80"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon Section */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer Pulsing Glow */}
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-32 h-32 bg-[#5DCAA5] rounded-full blur-2xl"
          />
          
          {/* Inner Rotating Dashed Border */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-24 h-24 rounded-full border-2 border-dashed border-[#5DCAA5]/40"
          />

          {/* Core Shield Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-[#2A2318] p-5 rounded-full border border-[#5DCAA5]/30 shadow-[0_0_30px_rgba(93,202,165,0.2)]"
          >
            <ShieldCheck className="w-10 h-10 text-[#5DCAA5]" />
          </motion.div>
        </div>

        {/* Brand Name */}
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight"
        >
          Varsity Resource <span className="text-[#5DCAA5]">Hub</span>
        </motion.h2>
        
        {/* Dynamic Loading Text */}
        <div className="flex items-center gap-3 text-[#5DCAA5] bg-[#2A2318]/80 px-6 py-2.5 rounded-full border border-[#5DCAA5]/20 backdrop-blur-md shadow-inner">
          <Loader2 className="w-5 h-5 animate-spin" />
          <AnimatePresence mode="wait">
            <motion.span
              key={loadingText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-xs sm:text-sm font-bold tracking-widest uppercase"
            >
              {loadingText}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      
    </div>
  );
}