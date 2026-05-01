"use client";

import { User, Upload, CheckCircle, Clock, XCircle, Edit } from "lucide-react";
import Image from "next/image";

export default function DashboardOverview() {
  // Mock User Data
  const user = {
    name: "John Doe",
    email: "john.doe@diu.edu.bd",
    department: "Software Engineering (SWE)",
    semester: "Semester 5",
    section: "PC-A",
    batch: "35",
    image: "/logo.png", // Mock image
  };

  // Mock Stats
  const stats = [
    { label: "Total Uploads", value: 12, icon: Upload, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Approved", value: 8, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { label: "Pending Review", value: 3, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Rejected", value: 1, icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-green-100 rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
            {user.image ? (
              <Image src={user.image} alt={user.name} width={128} height={128} className="object-cover" />
            ) : (
              <User size={48} className="text-green-600" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-gray-500 hover:text-green-600 transition-colors opacity-0 group-hover:opacity-100 border border-gray-100">
            <Edit size={16} />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 font-medium">{user.email}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Department</p>
              <p className="font-semibold text-gray-800">{user.department}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Semester</p>
              <p className="font-semibold text-gray-800">{user.semester}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Section</p>
              <p className="font-semibold text-gray-800">{user.section || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Batch</p>
              <p className="font-semibold text-gray-800">{user.batch || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">Your Contributions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
