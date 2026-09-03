"use client";

import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MaterialChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrls: string[];
  fileType: string;
}

export default function MaterialChatDrawer({ isOpen, onClose, fileUrls, fileType }: MaterialChatDrawerProps) {
  // Load initial messages from localStorage
  const chatKey = `chat-history-${fileUrls[0]}`;
  const [initialMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(chatKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Purge legacy message that asks user to upload materials
          if (parsed.length > 0 && parsed[0].content?.includes('upload the materials')) {
            localStorage.removeItem(chatKey);
            return [];
          }
          return parsed;
        } catch (e) {}
      }
    }
    return [];
  });

  const { messages, sendMessage, status, error } = useChat({
    api: '/api/chat',
    body: { fileUrls, fileType },
    initialMessages,
  } as any) as any;
  const [input, setInput] = useState('');
  const hasSentInitial = useRef(false);

  // Track if we just opened
  useEffect(() => {
    if (isOpen) {
      hasSentInitial.current = true;
    }
  }, [isOpen]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatKey, JSON.stringify(messages));
    }
  }, [messages, chatKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'streaming') return;
    sendMessage({ role: 'user', content: input });
    setInput('');
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 leading-tight">MRINMOYEE AI</h3>
                  <p className="text-xs text-slate-500">Atul Paul's Assistant</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-6 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                    <Bot size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    I've analyzed this material.
                  </h3>
                  <p className="text-slate-500 mb-8 max-w-sm text-sm">
                    What would you like me to do with it? Select an action below or ask your own question.
                  </p>

                  <div className="flex flex-col gap-3 w-full max-w-sm">
                    {[
                      { icon: '📝', label: 'Make Comprehensive Notes', prompt: 'Make comprehensive notes from this material.' },
                      { icon: '📚', label: 'Create Study Guide', prompt: 'Create a structured study guide based on this material.' },
                      { icon: '❓', label: 'Generate Questions', prompt: 'Generate 10 important questions and their answers from this material.' },
                      { icon: '🎯', label: 'Find Important Topics', prompt: 'List the most frequently tested or important topics in this material.' },
                      { icon: '🧠', label: 'Explain Difficult Topics', prompt: 'Explain the difficult or complex topics in this material simply.' }
                    ].map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage({ role: 'user', content: action.prompt })}
                        className="flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm group cursor-pointer"
                      >
                        <span className="text-xl">{action.icon}</span>
                        <span className="font-semibold text-slate-700 group-hover:text-emerald-700 text-sm text-left">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages?.map((m: any) => (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                    {m.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm whitespace-pre-wrap'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200 prose prose-sm prose-slate max-w-none'
                  }`} style={m.role === 'user' && m.content === 'Analyze these uploaded materials and make comprehensive notes.' ? { display: 'none' } : {}}>
                    {m.role === 'user' ? (
                      m.content || (m.parts && m.parts.map((p: any, i: number) => p.type === 'text' ? p.text : '').join('')) || ''
                    ) : (
                      <div className="markdown-body [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-bold [&>h3]:font-bold [&>table]:w-full [&>table]:border-collapse [&>table]:mb-3 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-200 [&_th]:p-2 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_code]:bg-slate-200 [&_code]:px-1 [&_code]:rounded">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content || (m.parts && m.parts.map((p: any, i: number) => p.type === 'text' ? p.text : '').join('')) || ''}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {(status === 'submitted' || status === 'streaming') && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>
                    <Bot size={48} className="text-green-500 animate-bounce relative z-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Processing Materials...</h3>
                  <p className="text-slate-500 text-sm">Please wait while I analyze the content and generate your notes.</p>
                </div>
              )}
              {error && (
                <div className="p-4 m-5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-center text-sm font-medium">
                  <p>Error connecting to AI</p>
                  <p className="text-red-500 text-xs mt-1">
                    {error.message}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={status === 'streaming'}
                  className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={status === 'streaming' || !input.trim()}
                  className="absolute right-2 w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-md transition-all"
                >
                  <Send size={16} className="ml-1" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
