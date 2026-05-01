"use client";

import { useState } from "react";
import { Shield, AlertTriangle, Key, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SecurityPage() {
  const router = useRouter();
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Danger Zone State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Password Strength Logic
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: "", color: "bg-gray-200" };
    let score = 0;
    if (newPassword.length > 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score < 2) return { score, label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { score, label: "Fair", color: "bg-yellow-500", width: "w-2/4" };
    if (score === 3) return { score, label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { score, label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const strength = getPasswordStrength();

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    alert("Password updated successfully! (Mock)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteStep === 1) {
      if (!deletePassword) return;
      setDeleteStep(2);
    } else if (deleteStep === 2) {
      if (deleteConfirmation === "DELETE") {
        alert("Account deleted. (Mock)");
        setShowDeleteModal(false);
        router.push("/");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Security</h1>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <Shield className="text-green-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Current Password</label>
            <div className="relative">
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">New Password</label>
            <div className="relative">
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" 
              />
            </div>
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                </div>
                <p className={`text-xs font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Confirm New Password</label>
            <div className="relative">
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full shadow-lg transition-all hover:-translate-y-0.5">
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone Section */}
      <div id="danger-zone" className="bg-red-50 rounded-3xl p-6 md:p-8 border border-red-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <AlertTriangle size={120} className="text-red-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
          </div>
          
          <p className="text-red-800 mb-6 max-w-xl">
            Once you delete your account, there is no going back. Please be certain. All your uploads, notes, and profile data will be permanently removed from the DIU Resource Hub.
          </p>

          <button 
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteStep(1);
            }}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow transition-all"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Multi-Step Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-red-100 shadow-2xl relative">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Are you absolutely sure?</h3>
              <p className="text-gray-500 mt-2 text-sm">This action cannot be undone.</p>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              {deleteStep === 1 ? (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Enter your password to continue:</label>
                  <input 
                    type="password" required autoFocus
                    value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                  />
                  <button type="submit" className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                    Continue
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-right-4">
                  <label className="text-sm font-bold text-gray-700">
                    Type <span className="text-red-600 select-all">DELETE</span> to confirm:
                  </label>
                  <input 
                    type="text" required autoFocus
                    value={deleteConfirmation} onChange={e => setDeleteConfirmation(e.target.value)}
                    className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-red-900 font-bold" 
                  />
                  <button 
                    type="submit" 
                    disabled={deleteConfirmation !== "DELETE"}
                    className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Permanently Delete Account
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
