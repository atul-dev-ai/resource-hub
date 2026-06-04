"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, AlertOctagon } from "lucide-react";
import MochiMascot from "@/components/MochiMascot";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Mascot, Validation & Loading State
  const [mochiStatus, setMochiStatus] = useState<'idle' | 'typing' | 'error' | 'success'>('idle');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security State (Anti-Spam / Rate Limiting)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Validation Logic
  const isValidEmail = email.trim().toLowerCase().endsWith("@diu.edu.bd");

// Handle CapsLock Detection Safely
  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      // Safety check: ensure getModifierState exists before calling it
      if (typeof e.getModifierState === 'function') {
        setCapsLockOn(e.getModifierState('CapsLock'));
      }
    };
    
    // Listen to both keyup and keydown for better accuracy
    window.addEventListener('keyup', handleKeyEvent as EventListener);
    window.addEventListener('keydown', handleKeyEvent as EventListener);
    
    return () => {
      window.removeEventListener('keyup', handleKeyEvent as EventListener);
      window.removeEventListener('keydown', handleKeyEvent as EventListener);
    };
  }, []);

  // Handle Lockout Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0 && failedAttempts >= 3) {
      setFailedAttempts(0); // Reset attempts after cooldown finishes
      setErrorMsg("");
    }
    return () => clearInterval(interval);
  }, [lockoutTimer, failedAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security Check: If locked out, prevent submission
    if (lockoutTimer > 0) {
      triggerShake();
      return;
    }

    if (!isValidEmail) {
      setErrorMsg("Please use your @diu.edu.bd email address.");
      setMochiStatus("error");
      triggerShake();
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Verifying credentials...");

    try {
      // 1. Supabase Login Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 2. Fetch User Role for Redirection
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, student_id")
          .eq("id", data.user.id)
          .single();

        if (profileError) console.error("Error fetching role:", profileError);

        const userRole = profile?.role || 'student';
        const studentId = profile?.student_id || 'new';

        setMochiStatus("success");
        setErrorMsg("");
        setFailedAttempts(0); // Reset failed attempts on success

        toast.success("Login successful! Redirecting...", { id: loadingToast });
        
        setTimeout(() => {
          // Role-based Redirect Logic
          if (['super_admin', 'admin', 'moderator'].includes(userRole)) {
            router.push(`/admin-portal/${studentId}`);
          } else {
            router.push(`/student-portal/${studentId}`);
          }
        }, 1500);
      }

    } catch (error: any) {
      setMochiStatus("error");
      const newFailedCount = failedAttempts + 1;
      setFailedAttempts(newFailedCount);

      // Lockout Logic: 3 strikes and you wait 30 seconds
      if (newFailedCount >= 3) {
        setLockoutTimer(30);
        setErrorMsg("Too many failed attempts. Please wait 30 seconds.");
        toast.error("Account temporarily locked due to security reasons.", { id: loadingToast });
      } else {
        setErrorMsg(error.message || "Invalid email or password.");
        toast.error("Login failed. Please check your credentials.", { id: loadingToast });
      }
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(false);
    setTimeout(() => setIsShaking(true), 10);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="min-h-screen bg-[#36312a] flex items-center justify-center p-6 md:p-12 relative overflow-hidden text-[#F0E8D5]">
      
      <Link href="/" className="absolute top-6 left-6 md:left-auto md:right-6 z-50 flex items-center gap-2 text-[#5DCAA5] hover:text-white bg-[#2A2318]/80 backdrop-blur-md border border-[#5DCAA5]/30 px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:bg-[#5DCAA5]/20 cursor-pointer">
        <ArrowLeft size={18} />
        <span className="hidden md:inline">Go to Home</span>
      </Link>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
        
        <div className={`bg-[#2A2318] p-8 md:p-10 rounded-3xl border border-[#5DCAA5]/20 shadow-2xl w-full max-w-sm mx-auto md:mx-0 transition-transform ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-white mb-2">Welcome Back!</h1>
            <p className="text-[#A89880]">Please enter your details to login.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-2 ml-4">Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                <input 
                  type="email" 
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@diu.edu.bd" 
                  disabled={lockoutTimer > 0}
                  required
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-4 pl-14 pr-4 text-lg focus:outline-none focus:border-[#5DCAA5] focus:ring-4 focus:ring-[#5DCAA5]/20 transition-all shadow-inner disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-2 ml-4">Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                <input 
                  type="password" 
                  value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setMochiStatus("typing")}
                  onBlur={() => setMochiStatus("idle")}
                  placeholder="••••••••••" 
                  disabled={lockoutTimer > 0}
                  required
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-4 pl-14 pr-4 text-lg focus:outline-none focus:border-[#5DCAA5] focus:ring-4 focus:ring-[#5DCAA5]/20 transition-all shadow-inner disabled:opacity-50"
                />
              </div>
              <div className="text-right mt-2 mr-2">
                <Link href="/forgot-password" className="text-sm font-semibold text-[#F0997B] hover:text-[#e47651] transition-colors cursor-pointer">forgot password?</Link>
              </div>
            </div>

            {/* Error & Lockout Message */}
            {errorMsg && (
              <div className="flex items-center justify-center gap-2 text-center text-[#F0997B] text-sm font-bold bg-[#F0997B]/10 py-3 px-4 rounded-xl border border-[#F0997B]/20">
                {lockoutTimer > 0 && <AlertOctagon size={16} />}
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting || lockoutTimer > 0}
              className={`w-full font-bold text-lg py-4 mt-4 rounded-full transition-all transform shadow-xl ${
                lockoutTimer > 0 
                  ? 'bg-red-900/50 text-red-300 cursor-not-allowed border border-red-500/30'
                  : isSubmitting 
                    ? 'bg-gray-600 text-gray-300 opacity-70 cursor-not-allowed' 
                    : 'bg-[#5DCAA5] hover:bg-[#4eb390] text-[#1C1812] hover:-translate-y-1 shadow-[#5DCAA5]/20 cursor-pointer'
              }`}
            >
              {lockoutTimer > 0 
                ? `Locked for ${lockoutTimer}s` 
                : isSubmitting 
                  ? "Logging in..." 
                  : "Login"
              }
            </button>

          </form>

          <div className="mt-10 text-center flex items-center justify-center gap-2 bg-[#36312a] p-1.5 rounded-full w-fit mx-auto border border-[#5DCAA5]/30">
            <div className="px-8 py-2 text-sm font-bold bg-[#5DCAA5] text-[#1C1812] rounded-full shadow-md cursor-pointer">Login</div>
            <Link href="/signup" className="px-8 py-2 text-sm font-bold text-[#5DCAA5] rounded-full hover:bg-[#5DCAA5]/10 transition-colors cursor-pointer">Signup</Link>
          </div>

        </div>

        <div className="hidden md:flex flex-col items-center justify-center">
          <MochiMascot status={mochiStatus} capsLockOn={capsLockOn} />
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}} />
    </div>
  );
}