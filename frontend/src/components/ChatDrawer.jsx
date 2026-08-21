import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Store, Sparkles, CheckCheck } from 'lucide-react';
import axios from 'axios';

export default function ChatDrawer({ isOpen, onClose, targetProduct, activeVendor, currentUser }) {
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const target = targetProduct || activeVendor;

  // Extract exact Store Name
  const getStoreName = () => {
    if (!target) return 'Store Seller';
    if (typeof target === 'string') return target;

    let name = null;

    if (typeof target.vendor === 'object' && target.vendor !== null) {
      name = target.vendor.storeName || target.vendor.name || target.vendor.email;
    }

    if (!name) {
      name = target.storeName || target.store || target.vendorName || target.brand;
    }

    if (!name && typeof target.vendor === 'string') {
      name = target.vendor;
    }

    if (name && typeof name === 'string' && name.trim() !== '') {
      return name.trim();
    }

    return 'Store Seller';
  };

  const getVendorId = () => {
    if (typeof target?.vendor === 'object' && target?.vendor !== null) {
      if (target.vendor._id || target.vendor.id) {
        return target.vendor._id || target.vendor.id;
      }
    }
    const sName = getStoreName();
    return sName.toLowerCase().replace(/\s+/g, '_');
  };

  const getBuyerId = () => {
    return currentUser?.email || currentUser?.id || currentUser?._id || 'customer_user';
  };

  const getBuyerName = () => {
    return currentUser?.name || 'Customer';
  };

  useEffect(() => {
    if (isOpen) {
      initChat();
    }
  }, [isOpen, targetProduct, activeVendor]);

  // Real-time polling for vendor replies every 2s
  useEffect(() => {
    let interval;
    if (isOpen && chat?._id) {
      interval = setInterval(() => {
        fetchLatestMessages(chat._id);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isOpen, chat?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const initChat = async () => {
    setLoading(true);
    const store = getStoreName();
    const vId = getVendorId();

    try {
      const res = await axios.post('/api/chat/start', {
        customerId: getBuyerId(),
        customerName: getBuyerName(),
        vendorId: vId,
        vendorName: store,
        storeName: store,
        productTitle: target?.title || target?.name || ''
      });
      if (res.data.success) {
        setChat(res.data.chat);
      }
    } catch (err) {
      console.error('Chat init error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestMessages = async (chatId) => {
    try {
      const res = await axios.get(`/api/chat/${chatId}`);
      if (res.data.success) {
        setChat(res.data.chat);
      }
    } catch (err) {
      console.error('Error fetching chat update:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text;
    setText('');
    const store = getStoreName();
    const vId = getVendorId();

    // Instant local optimistic update
    const newMsg = {
      senderId: getBuyerId(),
      senderName: getBuyerName(),
      senderRole: 'buyer',
      text: messageText,
      createdAt: new Date().toISOString()
    };

    setChat((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...(prev.messages || []), newMsg]
      };
    });

    try {
      const res = await axios.post('/api/chat/send', {
        chatId: chat?._id,
        customerId: getBuyerId(),
        customerName: getBuyerName(),
        vendorId: vId,
        storeName: store,
        senderId: getBuyerId(),
        senderName: getBuyerName(),
        senderRole: 'buyer',
        text: messageText
      });

      if (res.data.success) {
        setChat(res.data.chat);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (!isOpen) return null;

  const currentStore = getStoreName();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] flex flex-col h-[520px] animate-in slide-in-from-bottom duration-300">

      {/* Header */}
      <div className="bg-[#063F35] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#C9A86A] font-bold border border-white/15">
            <Store size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
              {currentStore}
              <Sparkles size={13} className="text-[#C9A86A]" />
            </h3>
            <p className="text-[10px] text-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Seller Support
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3 bg-[#FBF9F4]">
        {loading && (!chat || chat.messages.length === 0) ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            Connecting to {currentStore}...
          </div>
        ) : !chat?.messages || chat.messages.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-10 space-y-2">
            <MessageSquare size={32} className="mx-auto text-emerald-800/20" />
            <p className="font-semibold text-slate-600">Start chatting with {currentStore}</p>
            <p className="text-[11px] text-slate-400">Ask about availability, pricing, or shipping!</p>
          </div>
        ) : (
          chat.messages.map((msg, index) => {
            const isBuyer = msg.senderRole === 'buyer';
            return (
              <div
                key={index}
                className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs space-y-1 ${
                    isBuyer
                      ? 'bg-[#063F35] text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed font-medium">{msg.text}</p>
                  <div className={`flex items-center gap-1 text-[9px] ${isBuyer ? 'text-emerald-200 justify-end' : 'text-slate-400 justify-start'}`}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isBuyer && <CheckCheck size={11} className="text-[#C9A86A]" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${currentStore}...`}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#063F35] text-slate-900"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-[#063F35] hover:bg-[#0B3D35] disabled:opacity-50 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-md"
        >
          <Send size={15} />
        </button>
      </form>

    </div>
  );
}