"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#022c22] rounded-3xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#064e3b] border-b border-[#5DCAA5]/20">
        <div className="flex items-center gap-2">
          <button 
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(prev => prev - 1)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-slate-300 min-w-[80px] text-center">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button 
            disabled={pageNumber >= (numPages || 1)}
            onClick={() => setPageNumber(prev => prev + 1)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-xs font-bold text-slate-300 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(prev => Math.min(3.0, prev + 0.2))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomIn size={20} />
          </button>
        </div>

        <button 
          onClick={() => window.open(url, '_blank')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors text-sm font-bold cursor-pointer"
        >
          <Download size={16} /> <span className="hidden sm:inline">Download</span>
        </button>
      </div>

      {/* Document Area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center bg-slate-900 custom-scrollbar relative">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-full w-full absolute inset-0 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
              <p className="font-medium">Loading Document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-full w-full absolute inset-0 text-red-400">
              <p className="font-bold">Failed to load PDF file.</p>
              <p className="text-sm mt-2 opacity-80">The file might be corrupted or inaccessible.</p>
            </div>
          }
          className="flex justify-center w-full"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-2xl bg-white max-w-full"
            loading={
              <div className="flex items-center justify-center w-[600px] h-[800px] bg-slate-800 animate-pulse rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
              </div>
            }
          />
        </Document>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}</style>
    </div>
  );
}
