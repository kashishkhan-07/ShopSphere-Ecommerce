import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  TrendingUp,
  Store,
  CheckCircle,
  MessageCircle,
  Clock,
  UserCheck,
  XCircle,
  Send,
  User,
  Package,
  Layers,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';

export default function AdminPortal({ onOpenVendorChat, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'governance');
  const [metrics, setMetrics] = useState({
    totalGMV: 148990,
    platformCommission: 7449.50,
    totalOrders: 18,
  });

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // 💬 Admin <-> Vendor Direct Chat State
  const [allVendorChats, setAllVendorChats] = useState([]);
  const [selectedVendorChat, setSelectedVendorChat] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    fetchAdminData();
    fetchAdminVendorChats();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTab === 'vendor-chats') {
      fetchAdminVendorChats();
      interval = setInterval(() => {
        fetchAdminVendorChats();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [vRes, pRes] = await Promise.all([
        api.get('/vendors'),
        api.get('/products').catch(() => ({ data: { products: [] } }))
      ]);
      setVendors(vRes.data.vendors || []);
      setProducts(pRes.data.products || []);
    } catch (err) {
      console.error('Fetch admin vendors error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminVendorChats = async () => {
    try {
      const res = await axios.get('/api/chat/user/all');
      if (res.data.success) {
        setAllVendorChats(res.data.chats || []);
        if (selectedVendorChat) {
          const updated = res.data.chats.find((c) => c._id === selectedVendorChat._id);
          if (updated) setSelectedVendorChat(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching admin vendor chats:', err);
    }
  };

  const handleApproveVendor = async (vendorId, storeName) => {
    setActionLoading(vendorId);
    try {
      await api.patch(`/vendors/${vendorId}/approve`);
      setToastMsg(`Store "${storeName}" has been approved!`);
      setTimeout(() => setToastMsg(''), 3000);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectVendor = async (vendorId, storeName) => {
    setActionLoading(vendorId);
    try {
      await api.patch(`/vendors/${vendorId}/reject`);
      setToastMsg(`Store "${storeName}" application rejected.`);
      setTimeout(() => setToastMsg(''), 3000);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject vendor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedVendorChat) return;

    const msgText = adminReplyText;
    setAdminReplyText('');

    try {
      const res = await axios.post('/api/chat/send', {
        chatId: selectedVendorChat._id,
        senderId: 'super_admin',
        senderName: 'ShopSphere Admin',
        senderRole: 'admin',
        text: msgText
      });

      if (res.data.success) {
        setSelectedVendorChat(res.data.chat);
        fetchAdminVendorChats();
      }
    } catch (err) {
      console.error('Error sending admin reply:', err);
    }
  };

  const openVendorDirectChat = (vendorStoreName) => {
    const existing = allVendorChats.find(
      (c) =>
        c.storeName?.toLowerCase().includes(vendorStoreName.toLowerCase()) ||
        c.vendorName?.toLowerCase().includes(vendorStoreName.toLowerCase())
    );

    if (existing) {
      setSelectedVendorChat(existing);
    } else {
      // Create / Select chat demo fallback
      const mockChat = {
        _id: 'chat_' + Date.now(),
        customerName: 'Admin Priority Session',
        storeName: vendorStoreName,
        productTitle: 'Platform Support & Merchant Inquiry',
        messages: [
          {
            senderId: 'super_admin',
            senderName: 'ShopSphere Admin',
            senderRole: 'admin',
            text: `Hello ${vendorStoreName}! How can the Super Admin team assist your store today?`,
            createdAt: new Date().toISOString()
          }
        ]
      };
      setSelectedVendorChat(mockChat);
    }
    setActiveTab('vendor-chats');
  };

  const pendingVendors = vendors.filter((v) => v.vendorStatus === 'pending');
  const approvedVendors = vendors.filter((v) => v.vendorStatus === 'approved' || v.isVerified);
  const rejectedVendors = vendors.filter((v) => v.vendorStatus === 'rejected');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 shadow-sm">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#063F35] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-[#0B3D33]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#C9A86A]/20 text-[#C9A86A] px-3 py-1 rounded-full text-[11px] font-bold border border-[#C9A86A]/30">
            <ShieldCheck size={14} />
            <span>Super Admin Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Vendor Approvals & Governance
          </h1>
        </div>

        {/* Banner Navigation Tabs */}
        <div className="flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 text-xs font-bold flex-wrap justify-center">
          <button
            onClick={() => setActiveTab('governance')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'governance' ? 'bg-[#C9A86A] text-[#063F35] shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck size={14} /> Governance ({pendingVendors.length} Requests)
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'directory' ? 'bg-[#C9A86A] text-[#063F35] shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <Store size={14} /> Approved Stores ({approvedVendors.length})
          </button>

          <button
            onClick={() => setActiveTab('vendor-chats')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'vendor-chats' ? 'bg-[#C9A86A] text-[#063F35] shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <MessageSquare size={14} /> Vendor Support Chats
            {allVendorChats.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute top-1 right-1" />
            )}
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Pending Applications</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingVendors.length} Pending</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Approved Stores</span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{approvedVendors.length} Approved</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Platform GMV</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹{metrics.totalGMV.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Net Commission (5%)</span>
          <h3 className="text-2xl font-black text-[#063F35] mt-1">₹{metrics.platformCommission.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      {/* TAB 1: GOVERNANCE & PENDING VENDOR REQUESTS */}
      {activeTab === 'governance' && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <h3 className="text-base font-black text-amber-900 flex items-center gap-2">
              <Clock size={18} className="text-amber-600" />
              <span>Vendor Onboarding Requests ({pendingVendors.length})</span>
            </h3>
          </div>

          {pendingVendors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-amber-200 text-[10px] font-extrabold text-amber-800 uppercase">
                    <th className="py-2.5 px-2">Store Name</th>
                    <th className="py-2.5 px-2">Owner Email</th>
                    <th className="py-2.5 px-2">Commission</th>
                    <th className="py-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/60 text-xs font-medium">
                  {pendingVendors.map((v) => (
                    <tr key={v._id}>
                      <td className="py-3 px-2 font-black text-slate-900 flex items-center gap-2">
                        <Store size={15} className="text-amber-600" />
                        <span>{v.storeName}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-600">{v.user?.email || 'vendor@shopsphere.io'}</td>
                      <td className="py-3 px-2 font-bold text-slate-700">{v.commissionRate || 5.0}% Standard</td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <button
                          onClick={() => handleApproveVendor(v._id, v.storeName)}
                          disabled={actionLoading === v._id}
                          className="bg-[#063F35] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        >
                          <UserCheck size={13} /> Approve
                        </button>

                        <button
                          onClick={() => handleRejectVendor(v._id, v.storeName)}
                          disabled={actionLoading === v._id}
                          className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-amber-800 text-center py-4">No pending vendor applications at this time.</p>
          )}
        </div>
      )}

      {/* TAB 2: APPROVED STORES DIRECTORY BY CATEGORY & INVENTORY COUNT */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-3xl border shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Store size={18} className="text-[#063F35]" />
                <span>Approved Stores Directory ({approvedVendors.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Categorized by store niche field and listed product inventory</p>
            </div>

            <span className="text-xs font-extrabold bg-emerald-50 text-[#063F35] px-3 py-1 rounded-full border border-emerald-200">
              {products.length} Total Platform Products
            </span>
          </div>

          {/* Niche Category Chips Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
            {['All', 'Toys & Games', 'Fashion', 'Electronics', 'Beauty', 'Sports', 'Home & Kitchen', 'Books', 'Accessories'].map((cat) => {
              const isSel = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                    isSel
                      ? 'bg-[#063F35] text-white border-[#063F35] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] font-extrabold text-slate-400 uppercase">
                  <th className="py-3 px-2">Store & Owner</th>
                  <th className="py-3 px-2">Store Field / Category</th>
                  <th className="py-3 px-2">Listed Inventory</th>
                  <th className="py-3 px-2">Approval Status</th>
                  <th className="py-3 px-2 text-right">Support Chat</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium">
                {approvedVendors
                  .map((v) => {
                    const sName = (v.storeName || '').toLowerCase();
                    const uName = (v.user?.name || '').toLowerCase();
                    
                    const vProds = products.filter((p) => {
                      const pStore = (p.store || p.storeName || p.vendor?.storeName || p.brand || '').toLowerCase();
                      return (
                        pStore.includes(sName) ||
                        pStore.includes(uName) ||
                        (uName.includes('riya') && pStore.includes('cuddle')) ||
                        (v._id && p.vendor?._id === v._id)
                      );
                    });

                    const primaryCategory = vProds.length > 0
                      ? vProds[0].category || 'Toys & Games'
                      : (sName.includes('cuddle') ? 'Toys & Games' : 'Fashion');

                    return { ...v, vProds, pCount: vProds.length, primaryCategory };
                  })
                  .filter((v) => selectedCategory === 'All' || v.primaryCategory === selectedCategory)
                  .map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <img src={v.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'} className="w-9 h-9 rounded-xl object-cover border" />
                          <div>
                            <span className="font-extrabold text-slate-900 block">{v.storeName}</span>
                            <span className="text-[10px] text-slate-400">{v.user?.email || 'merchant@shopsphere.io'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2">
                        <span className="bg-emerald-50 text-[#063F35] text-[10px] font-black px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                          🏷️ {v.primaryCategory}
                        </span>
                      </td>

                      <td className="py-3 px-2 font-bold text-slate-800">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
                          📦 {v.pCount} Products Listed
                        </span>
                      </td>

                      <td className="py-3 px-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle size={11} /> Approved Seller
                        </span>
                      </td>

                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => openVendorDirectChat(v.storeName)}
                          className="bg-[#063F35] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl hover:bg-[#0B3D35] cursor-pointer shadow-xs"
                        >
                          <MessageCircle size={13} className="inline mr-1" /> Direct Chat
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN <-> VENDOR DIRECT SUPPORT COMMUNICATIONS */}
      {activeTab === 'vendor-chats' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
          {/* Vendor Conversation List */}
          <div className="md:col-span-4 border-r border-slate-100 bg-[#FBF9F4] p-4 space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Vendor Conversations</span>
              <span className="text-[10px] bg-emerald-100 text-[#063F35] px-2 py-0.5 rounded-full font-bold">
                {allVendorChats.length > 0 ? allVendorChats.length : approvedVendors.length} Active
              </span>
            </h3>
            
            <div className="space-y-2">
              {approvedVendors.map((v) => {
                const isSelected = selectedVendorChat?.storeName === v.storeName;
                return (
                  <button
                    key={v._id}
                    onClick={() => openVendorDirectChat(v.storeName)}
                    className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#063F35] text-white border-[#063F35] shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-[#063F35]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={v.logo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'} className="w-8 h-8 rounded-xl object-cover border" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs truncate">{v.storeName}</h4>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {v.user?.email || 'Registered Merchant'}
                        </p>
                      </div>
                    </div>
                    <Clock size={12} className={isSelected ? 'text-[#C9A86A]' : 'text-slate-400'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Stream */}
          <div className="md:col-span-8 flex flex-col justify-between p-4 bg-white">
            {selectedVendorChat ? (
              <>
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Store size={16} className="text-[#063F35]" />
                      <span>{selectedVendorChat.storeName}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Direct Super Admin Support Channel</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-[#063F35] px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Priority Admin Thread
                  </span>
                </div>

                <div className="flex-1 py-4 overflow-y-auto no-scrollbar space-y-3 min-h-[300px]">
                  {selectedVendorChat.messages?.map((m, idx) => {
                    const isAdminMsg = m.senderRole === 'admin' || m.senderId === 'super_admin';
                    return (
                      <div key={idx} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                            isAdminMsg
                              ? 'bg-[#063F35] text-white rounded-br-none shadow-md'
                              : 'bg-[#FBF9F4] text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                          }`}
                        >
                          <span className={`text-[10px] font-extrabold block mb-0.5 ${isAdminMsg ? 'text-[#C9A86A]' : 'text-[#063F35]'}`}>
                            {isAdminMsg ? 'Super Admin' : selectedVendorChat.storeName}
                          </span>
                          <p className="leading-relaxed font-medium">{m.text}</p>
                          <span className={`text-[9px] block text-right mt-1 ${isAdminMsg ? 'text-emerald-200' : 'text-slate-400'}`}>
                            {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendAdminReply} className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder={`Type message to ${selectedVendorChat.storeName}...`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                  />
                  <button
                    type="submit"
                    className="bg-[#063F35] hover:bg-[#0B3D35] text-white p-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-md"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-2">
                <MessageSquare size={32} className="text-slate-300" />
                <p>Select a vendor store from the left column to initiate direct support chat.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}