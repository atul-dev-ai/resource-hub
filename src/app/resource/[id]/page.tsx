import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Download, Share2, BookmarkPlus, Flag, FileText, Calendar, Eye, User, LayoutDashboard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ResourceViewer from "@/components/viewers/ResourceViewer";
import DownloadButton from "@/components/DownloadButton";
import ResourceAIAssistant from "@/components/ResourceAIAssistant";

export default async function ResourceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: resource, error } = await supabase
    .from("resources")
    .select("*, profiles(full_name)")
    .eq("id", id)
    .single();

  if (error || !resource) {
    return notFound();
  }

  const fileUrls = Array.isArray(resource.file_urls) ? resource.file_urls : [resource.file_urls];
  if (!fileUrls || fileUrls.length === 0 || !fileUrls[0]) return notFound();

  // Pick the first file for the previewer
  const fileUrl = fileUrls[0];

  // Create a default filename for downloading
  const fileName = resource.title ? `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}_ResourceHub` : `Resource_${id}`;

  return (
    <div className="min-h-screen bg-[#ecfdf5] text-[#022c22] pb-20 font-sans">
      {/* Top Navbar */}
      <div className="bg-[#022c22] border-b border-[#5DCAA5]/20 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/student-portal" className="flex items-center gap-2 text-[#6ee7b7] hover:text-[#5DCAA5] font-bold transition-colors">
            <ArrowLeft size={20} /> Back to Dashboard
          </Link>
          <div className="font-black text-xl text-white tracking-wide">Resource Details</div>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Preview Area */}
          <div className="lg:w-2/3 h-[500px] sm:h-[700px] lg:h-[85vh] sticky top-24 rounded-3xl shadow-2xl overflow-hidden bg-[#022c22] flex flex-col border border-[#5DCAA5]/20">
            <ResourceViewer fileUrls={fileUrls} />
          </div>

          {/* Right: Information */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-[#022c22] rounded-3xl p-6 shadow-xl border border-[#5DCAA5]/20">
              <div className="inline-block px-3 py-1 mb-4 bg-[#5DCAA5]/10 text-[#5DCAA5] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[#5DCAA5]/20">
                {resource.resource_type || "Document"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
                {resource.title}
              </h1>
              
              {resource.description && (
                <p className="text-[#6ee7b7] text-sm leading-relaxed mb-6 font-medium bg-[#064e3b] p-4 rounded-xl border border-[#5DCAA5]/10">
                  {resource.description}
                </p>
              )}

              <div className="space-y-4 border-t border-[#5DCAA5]/10 pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#064e3b] flex items-center justify-center text-[#5DCAA5] border border-[#5DCAA5]/20">
                    <LayoutDashboard size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#6ee7b7] uppercase tracking-widest">Course & Dept</p>
                    <p className="font-bold text-white">{resource.course_code || "N/A"} • {resource.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#064e3b] flex items-center justify-center text-[#F0997B] border border-[#F0997B]/20">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#6ee7b7] uppercase tracking-widest">Uploaded By</p>
                    <p className="font-bold text-white">{resource.profiles?.full_name || 'Anonymous'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#064e3b] flex items-center justify-center text-blue-400 border border-blue-400/20">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#6ee7b7] uppercase tracking-widest">Upload Date</p>
                    <p className="font-bold text-white">{new Date(resource.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#064e3b] flex items-center justify-center text-emerald-400 border border-emerald-400/20">
                    <Eye size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#6ee7b7] uppercase tracking-widest">Total Views</p>
                    <p className="font-bold text-white">{resource.views_count || 0} Views</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#022c22] rounded-3xl p-6 shadow-xl border border-[#5DCAA5]/20">
              <h3 className="font-black text-white mb-4 tracking-wide">Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <ResourceAIAssistant fileUrl={fileUrl} fileType={resource.resource_type || ''} />
                </div>
                {fileUrls.map((url: string, index: number) => (
                  <DownloadButton 
                    key={index} 
                    fileUrl={url} 
                    fileName={fileUrls.length > 1 ? `${fileName}_part${index + 1}` : fileName} 
                    label={fileUrls.length > 1 ? `Download Part ${index + 1}` : "Download"}
                  />
                ))}
                <button className="flex flex-col items-center justify-center gap-2 py-4 bg-[#064e3b] hover:bg-[#433c33] text-white rounded-2xl font-bold transition-all border border-[#5DCAA5]/10 cursor-pointer">
                  <Share2 size={24} className="text-blue-400" /> Share
                </button>
                <button className="flex flex-col items-center justify-center gap-2 py-4 bg-[#064e3b] hover:bg-[#433c33] text-white rounded-2xl font-bold transition-all border border-[#5DCAA5]/10 cursor-pointer">
                  <BookmarkPlus size={24} className="text-[#F0997B]" /> Save
                </button>
                <button className="flex flex-col items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-bold transition-all border border-red-500/20 cursor-pointer">
                  <Flag size={24} /> Report
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
