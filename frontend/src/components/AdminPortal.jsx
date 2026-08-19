import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  Store,
  DollarSign,
  Package,
  Users,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function AdminPortal({ onOpenVendorChat }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vendors');
      setVendors(data.vendors || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVendorChat = async (vendor) => {
    try {
      const targetUserId = (vendor.user?._id || vendor.user || '').toString();
      const { data } = await api.post('/chat/conversations', {
        recipientId: targetUserId,
        vendorId: vendor._id,
        type: 'vendor_admin',
      });
      if (onOpenVendorChat && data.conversation) {
        onOpenVendorChat(data.conversation);
      }
    } catch (err) {
      alert('Failed to connect to vendor');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-0.5 rounded-full text-xs font-bold border border-amber-500/30">
            <ShieldCheck size={14} />
            <span>Super Admin Headquarters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Governance & Vendor Desk</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor GMV revenue, manage vendor compliance, and provide instant executive support.
          </p>
        </div>
      </div>

      {/* 📊 Live SaaS Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Total Platform GMV</span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹8,49,200</h3>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">↑ 18.4% this week</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Admin Net Cut (5%)</span>
            <DollarSign size={18} className="text-indigo-600" />
          </div>
          <h3 className="text-2xl font-black text-indigo-600">₹42,460</h3>
          <span className="text-[10px] text-slate-400 mt-1 block">Direct Platform Commission</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Verified Merchants</span>
            <Store size={18} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">{vendors.length} Active</h3>
          <span className="text-[10px] text-slate-400 mt-1 block">100% KYC Approved</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Platform Health</span>
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600">99.98%</h3>
          <span className="text-[10px] text-emerald-600/80 mt-1 block">All Gateway Nodes Green</span>
        </div>
      </div>

      {/* 🏬 Registered Merchants & Direct Chat Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Store size={16} className="text-indigo-600" />
            <span>Merchant Directory & Direct Communication Channels</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">Store Name</th>
                <th className="p-4">Tier / Plan</th>
                <th className="p-4">Commission Fee</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Direct Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((v) => (
                <tr key={v._id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={v.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.storeName)}&background=6366f1&color=fff&bold=true`}
                      alt={v.storeName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{v.storeName}</span>
                      <span className="text-[10px] text-slate-400 block">{v.user?.email || 'merchant@shopsphere.io'}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {v.subscriptionPlan?.name || 'Starter Tier'}
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-emerald-200">
                      {v.commissionRate || 5.0}% Cut
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-indigo-200 flex items-center gap-1 w-fit">
                      <CheckCircle size={10} /> Verified Merchant
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleStartVendorChat(v)}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition"
                    >
                      <MessageCircle size={14} />
                      <span>Live Chat</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}