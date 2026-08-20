import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import { X, Send, MessageCircle, CheckCheck } from 'lucide-react';

export default function ChatDrawer({ isOpen, onClose, targetProduct }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=063F35&color=fff&bold=true`;

  useEffect(() => {
    if (isOpen && user) fetchConversations();
  }, [isOpen, user]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.conversations || []);
      if (!targetProduct && data.conversations?.length > 0 && !activeConvo) {
        selectConversation(data.conversations[0]);
      }
    } catch (err) {
      console.error('Fetch convos error:', err);
    }
  };

  const selectConversation = (convo) => {
    setActiveConvo(convo);
    fetchMessages(convo._id);
    socket.emit('join_conversation', convo._id);
  };

  const fetchMessages = async (convoId) => {
    try {
      const { data } = await api.get(`/chat/messages/${convoId}`);
      setMessages(data.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvo) return;
    const text = inputText.trim();
    setInputText('');

    const tempId = 'temp_' + Date.now();
    const optimisticMsg = {
      _id: tempId,
      conversation: activeConvo._id,
      sender: { _id: user._id || user.id, name: user.name },
      senderName: user.name,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom();

    try {
      const { data } = await api.post('/chat/messages', {
        conversationId: activeConvo._id,
        content: text,
      });
      if (data.message) {
        setMessages((prev) => prev.map((m) => (m._id === tempId ? data.message : m)));
      }
    } catch (err) {
      alert('Failed to send message');
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white w-full sm:max-w-xl h-full shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-4 py-3.5 bg-[#063F35] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#C9A86A]">
              <MessageCircle size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white">ShopSphere Live Messenger</h3>
              <span className="text-[10px] text-slate-300 block">Direct Seller & Support Gateway</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-full sm:w-1/3 border-r border-slate-100 bg-slate-50 p-2.5 space-y-1">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase px-2 block">Active Chats</span>
            {conversations.map((convo) => (
              <button
                key={convo._id}
                onClick={() => selectConversation(convo)}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeConvo?._id === convo._id ? 'bg-[#063F35] text-white shadow-xs' : 'hover:bg-slate-200/80 text-slate-800'
                }`}
              >
                <img src={convo.vendor?.logo || getAvatar(convo.vendor?.storeName)} className="w-7 h-7 rounded-full object-cover shrink-0" />
                <span className="truncate">{convo.vendor?.storeName || 'Merchant Chat'}</span>
              </button>
            ))}
          </div>

          {/* Message Area */}
          <div className="hidden sm:flex flex-1 flex-col bg-white">
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {messages.map((m) => {
                const isMe = (m.sender?._id || m.sender?.id || m.sender) === (user?._id || user?.id);
                return (
                  <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 text-xs rounded-2xl max-w-[80%] shadow-2xs ${
                      isMe ? 'bg-[#063F35] text-white rounded-tr-xs' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-slate-200' : 'text-slate-400'}`}>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <CheckCheck size={12} className="text-[#C9A86A]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs bg-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none"
              />
              <button type="submit" className="bg-[#063F35] text-white p-2.5 rounded-xl cursor-pointer">
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}