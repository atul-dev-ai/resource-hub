"use client";

import { useRouter } from "next/navigation";
import { Arvo } from "next/font/google";

const arvo = Arvo({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function NotFound() {
  const router = useRouter();

  return (
    <section className={`py-10 bg-white min-h-screen flex items-center justify-center text-slate-900 ${arvo.className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="w-full max-w-5xl text-center">
            
            <h1 className="text-[80px] sm:text-[100px] font-bold m-0 text-slate-800 leading-none">
              404
            </h1>
            
            <div 
              className="h-[300px] sm:h-[400px] bg-center bg-no-repeat"
              style={{ backgroundImage: "url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')" }}
            >
            </div>
            
            {/* Content Area */}
            <div className="-mt-4">
              <h3 className="text-3xl sm:text-[40px] font-bold mb-3 text-slate-800">
                Look like you're lost
              </h3>
              
              <p className="text-base sm:text-lg text-slate-600 mb-6">
                The page you are looking for is not available!
              </p>
              
              {/* 🔴 Go Back Button */}
              <button 
                onClick={() => router.back()} 
                className="inline-block px-8 py-3.5 bg-[#39ac31] hover:bg-[#2e8a27] text-white font-bold my-5 transition-all duration-300 rounded-xl cursor-pointer shadow-lg shadow-green-200 border-none outline-none"
              >
                Go Back
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}