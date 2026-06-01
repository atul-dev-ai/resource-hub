"use client";

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function DownloadButton({ fileUrl, fileName }: { fileUrl: string, fileName: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const toastId = toast.loading("Starting download...");
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      toast.success("Download complete!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to download file.", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isDownloading}
      className="flex flex-col items-center justify-center gap-2 py-4 bg-[#5DCAA5] hover:bg-[#4eb390] text-[#1C1812] rounded-2xl font-black transition-all shadow-lg shadow-[#5DCAA5]/20 cursor-pointer disabled:opacity-70 group"
    >
      {isDownloading ? (
        <Loader2 size={24} className="animate-spin" />
      ) : (
        <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
      )}
      {isDownloading ? "Downloading..." : "Download"}
    </button>
  );
}
