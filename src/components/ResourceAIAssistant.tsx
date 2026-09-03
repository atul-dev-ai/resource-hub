"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import MaterialChatDrawer from "./MaterialChatDrawer";

interface ResourceAIAssistantProps {
  fileUrls: string[];
  fileType: string;
}

export default function ResourceAIAssistant({ fileUrls, fileType }: ResourceAIAssistantProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className="w-full justify-center group relative flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-0.5 border border-white/10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <Bot size={20} className="relative z-10" />
        <span className="relative z-10">Ask AI to Make Notes</span>
        <Sparkles size={16} className="relative z-10 text-amber-300 animate-pulse" />
      </button>

      <MaterialChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        fileUrls={fileUrls}
        fileType={fileType}
      />
    </>
  );
}
