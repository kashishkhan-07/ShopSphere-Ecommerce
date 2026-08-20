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
  XCircle
} from 'lucide-react';

export default function AdminPortal({ onOpenVendorChat }) {
  const [metrics, setMetrics] = useState({
    totalGMV: 148990,
    platformCommission: 7449.50,
    totalOrders: 18,
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vendors');
      setVendors(data.vendors || []);
    } catch (err) {
      console.error('Fetch admin vendors error:', err);
    } finally {
      setLoading(false);
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

  const pendingVendors = vendors.filter((v) => v.vendorStatus === 'pending');
  const approvedVendors = vendors.filter((v) => v.vendorStatus === 'approved' || v.isVerified);
  const rejectedVendors = vendors.filter((v) => v.vendorStatus === 'rejected');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#063F35] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#C9A86A]/20 text-[#C9A86A] px-3 py-1 rounded-full text-[11px] font-bold border border-[#C9A86A]/30">
            <ShieldCheck size={14} />
            <span>Super Admin Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Vendor Approvals & Governance
          </h1>
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

      {/* 🛑 1. Pending Vendor Approval Requests */}
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
                        className="bg-[#063F35] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer inline-flex items-center gap-1"
                      >
                        <UserCheck size={13} /> Approve
                      </button>

                      <button
                        onClick={() => handleRejectVendor(v._id, v.storeName)}
                        disabled={actionLoading === v._id}
                        className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer inline-flex items-center gap-1"
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

      {/* 🏬 2. Approved Merchant Directory */}
      <div className="bg-white rounded-3xl border shadow-2xs p-6 space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b pb-3">
          <Store size={18} className="text-[#063F35]" />
          <span>Approved Stores Directory ({approvedVendors.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-[10px] font-extrabold text-slate-400 uppercase">
                <th className="py-3 px-2">Store Name</th>
                <th className="py-3 px-2">Owner Email</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs font-medium">
              {approvedVendors.map((v) => (
                <tr key={v._id}>
                  <td className="py-3 px-2 flex items-center gap-2">
                    <img src={v.logo} className="w-8 h-8 rounded-xl object-cover" />
                    <span className="font-bold text-slate-900">{v.storeName}</span>
                  </td>
                  <td className="py-3 px-2 text-slate-500">{v.user?.email || 'merchant@shopsphere.io'}</td>
                  <td className="py-3 px-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <CheckCircle size={10} /> Approved
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button onClick={onOpenVendorChat} className="bg-[#063F35] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer">
                      <MessageCircle size={13} className="inline mr-1" /> Chat
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