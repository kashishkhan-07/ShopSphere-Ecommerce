import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import {
  X,
  Send,
  MessageCircle,
  ArrowLeft,
  Trash2,
  CheckCheck,
  ShieldCheck,
  Store,
  Crown
} from 'lucide-react';

export default function ChatDrawer({ isOpen, onClose, targetProduct }) {
  const { user, isVendor, isAdmin } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff&bold=true`;

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (targetProduct && isOpen && user) {
      startProductChat(targetProduct);
    }
  }, [targetProduct, isOpen]);

  const startProductChat = async (product) => {
    try {
      setLoading(true);
      const { data } = await api.post('/chat/conversations', {
        recipientId: product.vendor?._id,
        vendorId: product.vendor?._id,
        productId: product._id,
      });
      if (data.conversation) {
        selectConversation(data.conversation);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      const convos = data.conversations || [];
      setConversations(convos);
      if (!targetProduct && convos.length > 0 && !activeConvo) {
        selectConversation(convos[0]);
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

  const handleDeleteConversation = async (convoId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      await api.delete(`/chat/conversations/${convoId}`);
      setActiveConvo(null);
      fetchConversations();
    } catch (err) {
      alert('Failed to delete conversation');
    }
  };

  const handleDeleteSingleMessage = async (messageId) => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (activeConvo && message.conversation === activeConvo._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      }
      fetchConversations();
    };

    const handleMessageDeleted = ({ messageId, conversationId }) => {
      if (activeConvo && activeConvo._id === conversationId) {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [activeConvo]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvo) return;

    const text = inputText.trim();
    setInputText('');

    try {
      await api.post('/chat/messages', {
        conversationId: activeConvo._id,
        content: text,
      });
    } catch (err) {
      alert('Failed to send message');
    }
  };

  if (!isOpen) return null;

  // 🏷️ Role-Aware Peer Label Resolver
  const getPeerInfo = (convo) => {
    if (!convo || !user) return { name: 'Support', role: 'Support', avatar: '', isSuperAdmin: false };
    const myId = (user._id || user.id).toString();
    const otherParticipant = convo.participants?.find((p) => (p._id || p).toString() !== myId);

    // If talking to Super Admin
    if (otherParticipant?.role === 'admin') {
      return {
        name: 'Platform Super Admin',
        role: 'Official HQ Desk',
        avatar: otherParticipant.avatar || 'https://ui-avatars.com/api/?name=Admin+HQ&background=f59e0b&color=fff&bold=true',
        isSuperAdmin: true,
      };
    }

    // If Super Admin talking to Vendor
    if (isAdmin) {
      return {
        name: convo.vendor?.storeName || otherParticipant?.name || 'Merchant',
        role: 'Verified Merchant',
        avatar: convo.vendor?.logo || getAvatar(convo.vendor?.storeName || otherParticipant?.name),
        isSuperAdmin: false,
      };
    }

    // If Vendor talking to Customer
    if (isVendor) {
      return {
        name: otherParticipant?.name || 'Customer',
        role: 'Buyer',
        avatar: otherParticipant?.avatar || getAvatar(otherParticipant?.name),
        isSuperAdmin: false,
      };
    }

    // If Customer talking to Vendor
    return {
      name: convo.vendor?.storeName || 'Merchant Store',
      role: 'Verified Seller',
      avatar: convo.vendor?.logo || getAvatar(convo.vendor?.storeName),
      isSuperAdmin: false,
    };
  };

  const peer = getPeerInfo(activeConvo);
  const myUserId = (user?._id || user?.id || '').toString();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end transition-all font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white w-full sm:max-w-xl h-full shadow-2xl flex flex-col">

        {/* Top Dark Header */}
        <div className="px-4 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            {activeConvo && (
              <button
                onClick={() => setActiveConvo(null)}
                className="sm:hidden p-1 text-slate-300 hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shrink-0">
              <MessageCircle size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                <span>ShopSphere Live Messenger</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                {isAdmin ? 'Admin Governance Desk' : isVendor ? 'Merchant Inquiries & HQ Channel' : 'Direct Seller Support'}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* Chat Main Body */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* Conversation List Sidebar */}
          <div className={`w-full sm:w-1/3 border-r border-slate-100 bg-slate-50 p-2.5 overflow-y-auto ${
            activeConvo ? 'hidden sm:block' : 'block'
          }`}>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 px-2 py-1 block">
              Active Chats ({conversations.length})
            </span>
            <div className="space-y-1 mt-1">
              {conversations.map((convo) => {
                const info = getPeerInfo(convo);
                const isSelected = activeConvo?._id === convo._id;
                return (
                  <button
                    key={convo._id}
                    onClick={() => selectConversation(convo)}
                    className={`w-full text-left p-2.5 rounded-2xl transition flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'hover:bg-slate-200/70 text-slate-700 bg-white sm:bg-transparent border sm:border-0 border-slate-200'
                    }`}
                  >
                    <img
                      src={info.avatar}
                      alt={info.name}
                      onError={(e) => { e.target.src = getAvatar(info.name); }}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/40"
                    />
                    <div className="truncate flex-1 min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {info.name}
                      </h4>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {convo.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Messages View */}
          <div className={`w-full sm:flex-1 flex flex-col bg-white ${
            !activeConvo ? 'hidden sm:flex' : 'flex'
          }`}>
            {activeConvo ? (
              <>
                {/* Clean Top Header */}
                <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={peer.avatar}
                        alt={peer.name}
                        onError={(e) => { e.target.src = getAvatar(peer.name); }}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 truncate leading-tight">
                          {peer.name}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          peer.isSuperAdmin
                            ? 'bg-amber-50 text-amber-700 border-amber-200 font-extrabold'
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {peer.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {activeConvo.product ? `Regarding: ${activeConvo.product.title}` : 'Direct Encrypted Channel'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleDeleteConversation(activeConvo._id)}
                      title="Delete Entire Chat"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 flex flex-col">
                  {messages.map((m) => {
                    const senderId = (m.sender?._id || m.sender?.id || m.sender || '').toString();
                    const isMe = senderId === myUserId;

                    return (
                      <div
                        key={m._id}
                        className={`group flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                          {isMe ? 'You' : m.senderName}
                        </span>

                        <div className={`flex items-center gap-1.5 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div
                            className={`px-4 py-2.5 text-xs shadow-xs transition-all ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-xs'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-xs'
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isMe ? 'text-indigo-200' : 'text-slate-400'
                            }`}>
                              <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && <CheckCheck size={12} className="text-indigo-200" />}
                            </div>
                          </div>

                          {isMe && (
                            <button
                              onClick={() => handleDeleteSingleMessage(m._id)}
                              title="Delete message"
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 text-xs bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl px-3.5 py-2.5 focus:outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-sm transition"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <MessageCircle size={36} className="mb-2 text-slate-300" />
                <h4 className="font-bold text-slate-700 text-xs">Select a Chat</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Choose a conversation from the left to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}