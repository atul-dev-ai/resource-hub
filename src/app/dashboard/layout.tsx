"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, UploadCloud, Settings, ShieldAlert, AlertTriangle, Menu, X, LogOut } from "lucide-react";
import Image from "next/image";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Uploads", href: "/dashboard/uploads", icon: FileText },
  { name: "Upload Content", href: "/dashboard/upload", icon: UploadCloud },
  { name: "Profile Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Security", href: "/dashboard/security", icon: ShieldAlert },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-green-50/30 flex text-gray-900 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-green-800">
            <Image src="/logo.png" alt="Logo" width={28} height={28} />
            ResourceHub
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? "bg-green-100 text-green-800 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-green-700"
                }`}
              >
                <Icon size={20} className={isActive ? "text-green-600" : "text-gray-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Danger Zone & Logout at bottom */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/dashboard/security#danger-zone"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <AlertTriangle size={20} className="text-red-500" />
            Danger Zone
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium">
            <LogOut size={20} className="text-gray-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-green-700 rounded-lg hover:bg-green-50"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-gray-800">Dashboard</span>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
