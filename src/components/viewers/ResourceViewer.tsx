"use client";

import dynamic from 'next/dynamic';
import { FileText } from 'lucide-react';

const PdfViewer = dynamic(() => import('@/components/viewers/PdfViewer'), { ssr: false });
const ImageViewer = dynamic(() => import('@/components/viewers/ImageViewer'), { ssr: false });

export default function ResourceViewer({ fileUrl }: { fileUrl: string }) {
  const isPdf = fileUrl.toLowerCase().includes(".pdf");
  const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null;

  if (isPdf) {
    return <PdfViewer url={fileUrl} />;
  }

  if (isImage) {
    return <ImageViewer url={fileUrl} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
      <FileText size={64} className="mb-4 opacity-50" />
      <p className="text-xl font-bold text-white mb-2">Preview not available</p>
      <p>This file type cannot be previewed in the browser.</p>
      <a 
        href={fileUrl} target="_blank" rel="noreferrer"
        className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
      >
        Download File
      </a>
    </div>
  );
}
