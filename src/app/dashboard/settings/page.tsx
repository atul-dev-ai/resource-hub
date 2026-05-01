"use client";

import { useState } from "react";
import { User, Camera, Lock, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function ProfileSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Profile Image */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">
            <div className="relative group">
              <div className="w-24 h-24 bg-green-100 rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                <Image src="/logo.png" alt="Profile" width={96} height={96} className="object-cover" />
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full shadow-md text-white hover:bg-green-700 transition-colors cursor-pointer cursor-pointer border-2 border-white">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/png, image/jpeg" />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-gray-900 text-lg">Profile Photo</h3>
              <p className="text-gray-500 text-sm">JPG or PNG, max 5MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Phone Number</label>
              <input type="tel" defaultValue="+880 1712 345678" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
            </div>

            {/* Email (Locked) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1">DIU Email <Lock size={12} className="text-gray-400" /></label>
              <input type="email" defaultValue="john.doe@diu.edu.bd" disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed" />
            </div>

            {/* Department (Locked/Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1">Department <Lock size={12} className="text-gray-400" /></label>
              <input type="text" defaultValue="SWE" disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed" />
            </div>
            
            {/* Semester (Locked/Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1">Semester <Lock size={12} className="text-gray-400" /></label>
              <input type="text" defaultValue="Semester 5" disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <div>
              {showSuccess && (
                <span className="flex items-center gap-2 text-green-600 font-medium animate-in fade-in">
                  <CheckCircle size={18} /> Settings saved
                </span>
              )}
            </div>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
