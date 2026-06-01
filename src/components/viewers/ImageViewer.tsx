"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import "yet-another-react-lightbox/styles.css";

export default function ImageViewer({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#022c22] rounded-3xl overflow-hidden p-6">
      <div 
        className="relative w-full max-w-2xl aspect-square sm:aspect-video cursor-zoom-in rounded-xl overflow-hidden border border-[#5DCAA5]/20 hover:border-[#5DCAA5]/50 transition-colors group"
        onClick={() => setOpen(true)}
      >
        <Image 
          src={url} 
          alt="Resource Image" 
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <span className="px-4 py-2 bg-slate-900/80 text-white font-bold rounded-lg backdrop-blur-sm">
            Click to expand
          </span>
        </div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src: url }]}
        plugins={[Zoom, Fullscreen]}
        carousel={{ finite: true }}
      />
    </div>
  );
}
