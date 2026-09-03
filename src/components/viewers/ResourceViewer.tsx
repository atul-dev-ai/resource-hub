"use client";

import dynamic from 'next/dynamic';
import { FileText } from 'lucide-react';

const PdfViewer = dynamic(() => import('@/components/viewers/PdfViewer'), { ssr: false });
const ImageViewer = dynamic(() => import('@/components/viewers/ImageViewer'), { ssr: false });

export default function ResourceViewer({ fileUrls }: { fileUrls: string[] }) {
  const firstUrl = fileUrls[0];
  const isPdf = firstUrl.toLowerCase().includes(".pdf");
  const isImage = firstUrl.match(/\.(jpeg|jpg|gif|png)$/i) != null;

  if (isPdf) {
    return <PdfViewer url={firstUrl} />;
  }

  if (isImage) {
    return <ImageViewer urls={fileUrls} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
      <FileText size={64} className="mb-4 opacity-50" />
      <p className="text-xl font-bold text-white mb-2">Preview not available</p>
      <p>This file type cannot be previewed in the browser.</p>
      <a 
        href={firstUrl} target="_blank" rel="noreferrer"
        className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
      >
        Download File
      </a>
    </div>
  );
}
