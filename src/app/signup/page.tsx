"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, BookOpen, Layers, ArrowLeft } from "lucide-react";
import MochiMascot from "@/components/MochiMascot";
import { signupUser } from "@/app/actions/auth";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  
  // Mascot & Validation State
  const [mochiStatus, setMochiStatus] = useState<'idle' | 'typing' | 'error' | 'success'>('idle');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic Validation Logic
  const isValidEmail = email.trim().toLowerCase().endsWith("@diu.edu.bd");
  const passwordsMatch = password === confirmPassword && password.length >= 6;
  const isFormValid = isValidEmail && passwordsMatch && fullName && department && semester;

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      setCapsLockOn(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating account...");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("fullName", fullName);
    formData.append("department", department);
    formData.append("semester", semester);

    const result = await signupUser(formData);

    if (result.error) {
      setMochiStatus("error");
      setErrorMsg(result.error);
      toast.error(result.error, { id: loadingToast });
      setIsSubmitting(false);
    } else {
      setMochiStatus("success");
      setErrorMsg("");
      toast.success("Signup successful! Please check your email. Redirecting...", { id: loadingToast });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#36312a] flex items-center justify-center p-6 md:p-12 relative overflow-hidden text-[#F0E8D5]">
      
      {/* Removed verification modal, using toast instead */}

      {/* Go to Home Button */}
      <Link href="/" className="absolute top-6 left-6 md:left-auto md:right-6 z-50 flex items-center gap-2 text-[#5DCAA5] hover:text-white bg-[#2A2318]/80 backdrop-blur-md border border-[#5DCAA5]/30 px-4 py-2 rounded-full font-bold transition-all shadow-lg hover:bg-[#5DCAA5]/20">
        <ArrowLeft size={18} />
        <span className="hidden md:inline">Go to Home</span>
      </Link>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Form */}
        <div className="bg-[#2A2318] p-8 md:p-10 rounded-3xl border border-[#5DCAA5]/20 shadow-2xl relative z-10 w-full max-w-md mx-auto md:mx-0">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-white mb-2">Create Your Account</h1>
            <p className="text-[#F0997B] font-semibold text-sm">Strictly only DIU students allowed.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-1 ml-4">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                <input 
                  type="text" 
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe" 
                  required
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-1 ml-4">DIU Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                <input 
                  type="email" 
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@diu.edu.bd" 
                  required
                  className={`w-full bg-[#36312a] border ${email && !isValidEmail ? 'border-[#F0997B]' : 'border-[#5DCAA5]/50'} text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20 transition-all`}
                />
              </div>
              {email && !isValidEmail && <p className="text-[#F0997B] text-xs mt-1 ml-4">Must be a @diu.edu.bd email</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-1 ml-4">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                  <input 
                    type="password" 
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setMochiStatus("typing")}
                    onBlur={() => setMochiStatus("idle")}
                    placeholder="••••••••" 
                    required minLength={6}
                    className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-1 ml-4">Confirm</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                  <input 
                    type="password" 
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={() => setMochiStatus("typing")}
                    onBlur={() => setMochiStatus("idle")}
                    placeholder="••••••••" 
                    required
                    className={`w-full bg-[#36312a] border ${confirmPassword && !passwordsMatch ? 'border-[#F0997B]' : 'border-[#5DCAA5]/50'} text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-[#5DCAA5] focus:ring-2 focus:ring-[#5DCAA5]/20 transition-all`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-1 ml-4">Department</label>
                <div className="relative">
                  <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                  <select 
                    value={department} onChange={e => setDepartment(e.target.value)} required
                    className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3 pl-12 pr-4 appearance-none focus:outline-none focus:border-[#5DCAA5]"
                  >
                    <option value="" disabled>Select</option>
                    <option value="CSE">CSE</option>
                    <option value="SWE">SWE</option>
                    <option value="BBA">BBA</option>
                    <option value="EEE">EEE</option>
                    <option value="English">English</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="NFE">NFE</option>
                    <option value="Civil">Civil</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Law">Law</option>
                    <option value="JMC">JMC</option>
                    <option value="CIS">CIS</option>
                    <option value="CS">CS</option>
                    <option value="ESD">ESD</option>
                  </select>
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-1 ml-4">Semester</label>
                <div className="relative">
                  <Layers size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5DCAA5]" />
                  <select 
                    value={semester} onChange={e => setSemester(e.target.value)} required
                    className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3 pl-12 pr-4 appearance-none focus:outline-none focus:border-[#5DCAA5]"
                  >
                    <option value="" disabled>Select</option>
                    <option value="Semester 1">Sem 1</option>
                    <option value="Semester 2">Sem 2</option>
                    <option value="Semester 3">Sem 3</option>
                    <option value="Semester 4">Sem 4</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Section (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-1 ml-4">Section (Opt)</label>
                <input 
                  type="text" placeholder="e.g. PC-A" 
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3 px-4 focus:outline-none focus:border-[#5DCAA5] transition-all"
                />
              </div>

              {/* Batch (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#5DCAA5] uppercase tracking-wider mb-1 ml-4">Batch (Opt)</label>
                <input 
                  type="text" placeholder="e.g. 35" 
                  className="w-full bg-[#36312a] border border-[#5DCAA5]/50 text-white rounded-full py-3 px-4 focus:outline-none focus:border-[#5DCAA5] transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-center text-[#F0997B] text-sm font-semibold bg-[#F0997B]/10 py-2 rounded-lg">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-4 mt-4 rounded-full font-bold text-[#1C1812] transition-all duration-300 transform ${isFormValid && !isSubmitting ? 'bg-[#5DCAA5] hover:-translate-y-1 shadow-lg shadow-[#5DCAA5]/20 cursor-pointer' : 'bg-gray-600 cursor-not-allowed opacity-50'}`}
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </button>

          </form>

          {/* Toggle Tab */}
          <div className="mt-8 text-center flex items-center justify-center gap-2 bg-[#36312a] p-1.5 rounded-full w-fit mx-auto border border-[#5DCAA5]/30">
            <Link href="/login" className="px-6 py-1.5 text-sm font-bold text-[#5DCAA5] rounded-full hover:bg-[#5DCAA5]/10 transition-colors">Login</Link>
            <div className="px-6 py-1.5 text-sm font-bold bg-[#5DCAA5] text-[#1C1812] rounded-full">Sign Up</div>
          </div>

        </div>

        {/* Right Column: Mascot */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <MochiMascot status={mochiStatus} capsLockOn={capsLockOn} />
        </div>

      </div>
    </div>
  );
}
