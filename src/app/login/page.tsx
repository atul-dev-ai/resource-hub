"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import MochiMascot from "@/components/MochiMascot";
import { loginUser } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Mascot & Validation State
  const [mochiStatus, setMochiStatus] = useState<'idle' | 'typing' | 'error' | 'success'>('idle');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  // Validation Logic
  const isValidEmail = email.trim().toLowerCase().endsWith("@diu.edu.bd");

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      setCapsLockOn(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail) {
      setErrorMsg("Please use your @diu.edu.bd email address.");
      setMochiStatus("error");
      triggerShake();
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginUser(formData);

    if (result.error) {
      setMochiStatus("error");
      setErrorMsg(result.error);
      triggerShake();
    } else {
      setMochiStatus("success");
      setErrorMsg("");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500); // Wait for the surprised animation to finish
    }
  };

  const triggerShake = () => {
    setIsShaking(false);
    setTimeout(() => setIsShaking(true), 10);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="min-h-screen bg-[#36312a] flex items-center justify-center p-6 md:p-12 relative overflow-hidden text-[#F0E8D5]">
      
      {/* Go to Home Button */}
      <Link href="/" className="absolute top-6 left-6 md:left-auto md:right-6 z-50 flex items-center gap-2 text-[#5DCAA5] hover:text-white bg-[#2A2318]/80 backdrop-blur-md border border-[#5DCAA5]/30 px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:bg-[#5DCAA5]/20">
        <ArrowLeft size={18} />
        <span className="hidden md:inline">Go to Home</span>
      </Link>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
        
        {/* Left Column: Form */}
        <div className={`bg-[#2A2318] p-8 md:p-10 rounded-3xl border border-[#5DCAA5]/20 shadow-2xl w-full max-w-sm mx-auto md:mx-0 transition-transform ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-white mb-2">Welcome Back!</h1>
            <p className="text-[#A89880]">Please enter your details to login.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-2 ml-4">Email</label>
              <div className="relative">
                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                <input 
                  type="email" 
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Sarah.example@diu.edu.bd" 
                  required
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-4 pl-14 pr-4 text-lg focus:outline-none focus:border-[#5DCAA5] focus:ring-4 focus:ring-[#5DCAA5]/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
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
                  required
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-4 pl-14 pr-4 text-lg focus:outline-none focus:border-[#5DCAA5] focus:ring-4 focus:ring-[#5DCAA5]/20 transition-all shadow-inner"
                />
              </div>
              <div className="text-right mt-2 mr-2">
                <a href="#" className="text-sm font-semibold text-[#F0997B] hover:text-[#e47651] transition-colors">forgot password?</a>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-center text-[#F0997B] text-sm font-bold bg-[#F0997B]/10 py-3 rounded-xl border border-[#F0997B]/20">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-[#5DCAA5] hover:bg-[#4eb390] text-[#1C1812] font-bold text-lg py-4 mt-4 rounded-full transition-all transform hover:-translate-y-1 shadow-xl shadow-[#5DCAA5]/20"
            >
              Login
            </button>

          </form>

          {/* Toggle Tab */}
          <div className="mt-10 text-center flex items-center justify-center gap-2 bg-[#36312a] p-1.5 rounded-full w-fit mx-auto border border-[#5DCAA5]/30">
            <div className="px-8 py-2 text-sm font-bold bg-[#5DCAA5] text-[#1C1812] rounded-full shadow-md">Login</div>
            <Link href="/signup" className="px-8 py-2 text-sm font-bold text-[#5DCAA5] rounded-full hover:bg-[#5DCAA5]/10 transition-colors">Signup</Link>
          </div>

        </div>

        {/* Right Column: Mascot */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <MochiMascot status={mochiStatus} capsLockOn={capsLockOn} />
        </div>

      </div>

      {/* Tailwind configuration for the shake animation inline */}
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
