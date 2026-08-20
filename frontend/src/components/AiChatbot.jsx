import React, { useState } from 'react';
import api from '../services/api';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am **SphereAI Assistant**. How can I help you find products or track your orders today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: userText });
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply || 'I am ready to help!' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Star Button (Bottom-Right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-[#063F35] text-[#C9A86A] p-3.5 rounded-full shadow-2xl border border-[#C9A86A]/40 hover:scale-105 transition cursor-pointer flex items-center justify-center"
        title="Open SphereAI Assistant"
      >
        <Sparkles size={22} />
      </button>

      {/* SphereAI Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[480px] overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in zoom-in-95 duration-200">

          <div className="bg-[#063F35] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#C9A86A]" />
              <div>
                <h3 className="font-bold text-xs">SphereAI Assistant</h3>
                <span className="text-[9px] text-slate-300">24/7 Contextual Marketplace Engine</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-slate-50/50 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.sender === 'user' ? 'bg-[#063F35] text-white' : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-2 border-t border-slate-100 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask SphereAI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs bg-slate-100 rounded-xl px-3 py-2 focus:outline-none"
            />
            <button type="submit" disabled={loading} className="bg-[#063F35] text-white p-2 rounded-xl">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}