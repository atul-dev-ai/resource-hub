"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-green-950 text-green-50 pt-16 pb-8 border-t border-green-900 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Links and Brand */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="ResourceHub Logo" width={40} height={40} className="w-10 h-10 object-contain" />
              <h2 className="text-2xl font-bold text-white tracking-tight">ResourceHub</h2>
            </div>
            <p className="text-green-200/80 max-w-sm text-sm sm:text-base leading-relaxed">
              The ultimate platform for university students to share, find, and discuss study materials, past questions, and assignments.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-start">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-green-200 hover:text-white transition-colors text-sm sm:text-base">About Us</Link></li>
              <li><Link href="/contact" className="text-green-200 hover:text-white transition-colors text-sm sm:text-base">Contact</Link></li>
              <li><Link href="/faq" className="text-green-200 hover:text-white transition-colors text-sm sm:text-base">FAQ</Link></li>
              <li><Link href="/privacy" className="text-green-200 hover:text-white transition-colors text-sm sm:text-base">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-green-200 hover:text-white transition-colors text-sm sm:text-base">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-start">
            <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center text-green-300 hover:bg-green-700 hover:text-white transition-colors shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center text-green-300 hover:bg-green-700 hover:text-white transition-colors shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center text-green-300 hover:bg-green-700 hover:text-white transition-colors shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center text-green-300 hover:bg-green-700 hover:text-white transition-colors shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-green-900/60 mb-8"></div>

        {/* Bottom Section: Developer Info & Copyright */}
        {/* FIX: Changed items-start md:items-center to simply items-center so it centers on mobile too */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-8 md:gap-6">
          <p className="text-green-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} ResourceHub. All rights reserved.
          </p>
          
          {/* Developer Section */}
          <div className="flex items-center gap-4 bg-green-900/40 p-3 pr-6 rounded-full border border-green-800/50 backdrop-blur-sm shadow-inner transition-transform hover:scale-105 w-fit">
            <div className="relative">
              <Image 
                src="/atul2.jpg" 
                alt="Atul Paul" 
                width={48} 
                height={48} 
                className="w-12 h-12 rounded-full border-2 border-green-500 object-cover shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <Image 
                  src="/light-mode.png" 
                  alt="Light Mode Icon" 
                  width={16} 
                  height={16} 
                  className="w-4 h-4 object-contain"
                />
              </div>
            </div>
            
            <div className="flex flex-col text-left">
              <span className="text-xs text-green-300 font-medium uppercase tracking-wider">Developed By</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white leading-none mt-1">Atul Paul</span>
                <Link href="https://github.com/atulpaul" target="_blank" className="text-green-400 hover:text-white transition-colors mt-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}