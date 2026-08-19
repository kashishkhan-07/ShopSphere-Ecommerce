import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Sparkles,
  X,
  Send,
  Bot,
  CheckCircle,
  Package,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const QUICK_PROMPTS = [
  '🛍️ Recommend trending products',
  '📦 Track my latest order',
  '🔒 How does Stripe escrow work?',
  '🏬 How to sell on ShopSphere?',
];

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! 👋 I'm **SphereAI**, your 24/7 intelligent marketplace assistant. Ask me about products, live order tracking, or store policies!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: query.trim() });
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "I'm having a brief connection issue. Please try again in a moment!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🪄 Smart Formatter: Converts markdown **stars** into clean, beautiful bold text
  const formatAiMessage = (content) => {
    if (!content) return null;

    // Split content by lines
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-1.5" />;

      // Parse bold **text** and *italic*
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);

      const parsedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-extrabold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <span key={pIdx} className="text-indigo-600 font-semibold">
              {part.slice(1, -1)}
            </span>
          );
        }
        return part;
      });

      // Render bullet items nicely
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 pl-1">
            <span className="text-indigo-500 font-bold leading-none mt-1">•</span>
            <div className="flex-1 leading-snug">{parsedLine}</div>
          </div>
        );
      }

      return (
        <p key={idx} className="my-0.5 leading-relaxed">
          {parsedLine}
        </p>
      );
    });
  };

  return (
    <>
            {/* 🔮 Ultra-Clean Floating AI Assistant Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:scale-105 text-white px-4 py-3 rounded-full shadow-2xl shadow-indigo-500/40 flex items-center gap-2 transition-all duration-300 group font-['Plus_Jakarta_Sans',sans-serif] border border-white/20 cursor-pointer"
        >
          <Sparkles size={16} className="text-amber-300 shrink-0" />
          <span className="font-extrabold text-xs tracking-wide">
            SphereAI Assistant
          </span>
        </button>
      )}

      {/* 🤖 AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-['Plus_Jakarta_Sans',sans-serif] animate-in slide-in-from-bottom-5 duration-300 max-h-[85vh] h-[550px]">

          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>SphereAI Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                </h3>
                <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                  24/7 Context-Aware Intelligence
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] shrink-0">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((m, idx) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Sparkles size={12} className="text-amber-300" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                      isAi
                        ? 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-xs'
                        : 'bg-indigo-600 text-white rounded-2xl rounded-tr-xs font-semibold'
                    }`}
                  >
                    {isAi ? formatAiMessage(m.text) : m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <div className="w-6 h-6 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles size={12} className="animate-spin text-indigo-600" />
                </div>
                <span className="text-[11px]">SphereAI is searching live catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about products, live tracking..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl px-3.5 py-2.5 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-md shadow-indigo-200 transition"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}