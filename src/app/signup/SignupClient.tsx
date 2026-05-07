"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, AlertOctagon, User, Building2, CalendarClock, Eye, EyeOff } from "lucide-react";
import MochiMascot from "@/components/MochiMascot";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

export default function SignupClient() {
  const router = useRouter();
  const supabase = createClient();
  
  // Data Fetching States
  const [loadingData, setLoadingData] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "",
    sessionId: ""
  });
  
  // Mascot, Validation & Loading State
  const [mochiStatus, setMochiStatus] = useState<'idle' | 'typing' | 'error' | 'success'>('idle');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Security State
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Fetch Registration Data
  useEffect(() => {
    fetchRegistrationData();
  }, []);

  const fetchRegistrationData = async () => {
    setLoadingData(true);
    try {
      const [deptRes, sessionRes] = await Promise.all([
        supabase.from("departments").select("code, name").order("code"),
        supabase.from("academic_sessions").select("id, term, year, batch_code").eq("is_active", true).order("year", { ascending: false })
      ]);

      setDepartments(deptRes.data || []);
      setSessions(sessionRes.data || []);
    } catch (error) {
      toast.error("Failed to load academic data. Please refresh.");
    } finally {
      setLoadingData(false);
    }
  };

  // Handle CapsLock
  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      if (typeof e.getModifierState === 'function') {
        setCapsLockOn(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keyup', handleKeyEvent as EventListener);
    window.addEventListener('keydown', handleKeyEvent as EventListener);
    return () => {
      window.removeEventListener('keyup', handleKeyEvent as EventListener);
      window.removeEventListener('keydown', handleKeyEvent as EventListener);
    };
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, password: val });
    
    let strength = 0;
    if (val.length >= 8) strength += 1;
    if (/[A-Z]/.test(val)) strength += 1;
    if (/[0-9]/.test(val)) strength += 1;
    if (/[^A-Za-z0-9]/.test(val)) strength += 1;
    setPasswordStrength(strength);
  };

  const triggerShake = () => {
    setIsShaking(false);
    setTimeout(() => setIsShaking(true), 10);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutTimer > 0) {
      triggerShake();
      return;
    }

    const isValidEmail = formData.email.trim().toLowerCase().endsWith("@diu.edu.bd");

    if (!isValidEmail) {
      setErrorMsg("Please use your @diu.edu.bd email address.");
      setMochiStatus("error");
      triggerShake();
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      setMochiStatus("error");
      triggerShake();
      return;
    }

    if (!formData.department || !formData.sessionId) {
      setErrorMsg("Please select your Department and Batch.");
      setMochiStatus("error");
      triggerShake();
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setMochiStatus("idle");
    setErrorMsg("");
    const loadingToast = toast.loading("Creating secure account...");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: formData.fullName,
            department: formData.department,
            session_id: formData.sessionId,
            role: 'student'
          }
        }
      });

      if (error) throw error;

      setMochiStatus("success");
      toast.success("Account created! Please check your email to verify.", { id: loadingToast, duration: 6000 });
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      setMochiStatus("error");
      if (error.status === 429) {
        setLockoutTimer(30);
        setErrorMsg("Too many attempts. Please wait.");
        toast.error("Rate limit exceeded.", { id: loadingToast });
      } else {
        setErrorMsg(error.message || "Failed to create account.");
        toast.error("Registration failed.", { id: loadingToast });
      }
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#36312a] flex items-center justify-center p-6 md:p-12 relative overflow-hidden text-[#F0E8D5]">
      
      <Link href="/" className="absolute top-6 left-6 md:left-auto md:right-6 z-50 flex items-center gap-2 text-[#5DCAA5] hover:text-white bg-[#2A2318]/80 backdrop-blur-md border border-[#5DCAA5]/30 px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:bg-[#5DCAA5]/20 cursor-pointer">
        <ArrowLeft size={18} />
        <span className="hidden md:inline">Go to Home</span>
      </Link>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
        
        <div className={`bg-[#2A2318] p-8 md:p-10 rounded-3xl border border-[#5DCAA5]/20 shadow-2xl w-full max-w-md mx-auto md:mx-0 transition-transform ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-white mb-2">Student Registration</h1>
            <p className="text-[#A89880] text-sm">Create your secure account to access the portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-2 ml-4">Full Name</label>
              <div className="relative">
                <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                <input 
                  type="text" required
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                  placeholder="John Doe" 
                  disabled={lockoutTimer > 0}
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3.5 pl-14 pr-4 text-sm md:text-base focus:outline-none focus:border-[#5DCAA5] focus:ring-4 focus:ring-[#5DCAA5]/20 transition-all shadow-inner disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-2 ml-4">University Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                <input 
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  onFocus={() => setMochiStatus("idle")}
                  placeholder="name@diu.edu.bd" 
                  disabled={lockoutTimer > 0}
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3.5 pl-14 pr-4 text-sm md:text-base focus:outline-none focus:border-[#5DCAA5] focus:ring-4 focus:ring-[#5DCAA5]/20 transition-all shadow-inner disabled:opacity-50"
                />
              </div>
            </div>

            {/* Department & Batch Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-2 ml-4">Department</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                  <select 
                    required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                    disabled={loadingData || lockoutTimer > 0}
                    className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3.5 pl-10 pr-8 text-xs md:text-sm focus:outline-none focus:border-[#5DCAA5] focus:ring-4 focus:ring-[#5DCAA5]/20 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Dept</option>
                    {departments.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-2 ml-4">Batch/Session</label>
                <div className="relative">
                  <CalendarClock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                  <select 
                    required value={formData.sessionId} onChange={e => setFormData({...formData, sessionId: e.target.value})}
                    disabled={loadingData || lockoutTimer > 0}
                    className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3.5 pl-10 pr-8 text-xs md:text-sm focus:outline-none focus:border-[#5DCAA5] focus:ring-4 focus:ring-[#5DCAA5]/20 appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Batch</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.batch_code} ({s.term})</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-2 ml-4">Secure Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                <input 
                  type={showPassword ? "text" : "password"} required
                  value={formData.password} onChange={handlePasswordChange}
                  onFocus={() => setMochiStatus("typing")}
                  onBlur={() => setMochiStatus("idle")}
                  placeholder="Minimum 8 characters" 
                  disabled={lockoutTimer > 0}
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3.5 pl-14 pr-12 text-sm md:text-base focus:outline-none focus:border-[#5DCAA5] focus:ring-4 focus:ring-[#5DCAA5]/20 transition-all shadow-inner disabled:opacity-50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#5DCAA5]/60 hover:text-[#5DCAA5] transition-colors cursor-pointer">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              <div className="flex gap-1 h-1.5 w-full mt-3 px-2">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level} className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level ? (passwordStrength > 2 ? 'bg-[#5DCAA5]' : 'bg-[#F0997B]') : 'bg-[#36312a]'}`}></div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center justify-center gap-2 text-center text-[#F0997B] text-sm font-bold bg-[#F0997B]/10 py-3 px-4 rounded-xl border border-[#F0997B]/20">
                <AlertOctagon size={16} />
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting || lockoutTimer > 0 || loadingData}
              className={`w-full font-bold text-lg py-4 mt-2 rounded-full transition-all transform shadow-xl ${
                lockoutTimer > 0 
                  ? 'bg-red-900/50 text-red-300 cursor-not-allowed border border-red-500/30'
                  : isSubmitting || loadingData
                    ? 'bg-gray-600 text-gray-300 opacity-70 cursor-not-allowed' 
                    : 'bg-[#5DCAA5] hover:bg-[#4eb390] text-[#1C1812] hover:-translate-y-1 shadow-[#5DCAA5]/20 cursor-pointer'
              }`}
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>

          </form>

          {/* Toggle Button */}
          <div className="mt-8 text-center flex items-center justify-center gap-2 bg-[#36312a] p-1.5 rounded-full w-fit mx-auto border border-[#5DCAA5]/30">
            <Link href="/login" className="px-8 py-2 text-sm font-bold text-[#5DCAA5] rounded-full hover:bg-[#5DCAA5]/10 transition-colors cursor-pointer">Login</Link>
            <div className="px-8 py-2 text-sm font-bold bg-[#5DCAA5] text-[#1C1812] rounded-full shadow-md cursor-pointer">Signup</div>
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