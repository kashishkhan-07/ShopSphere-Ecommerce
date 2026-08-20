import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Store,
  Users,
  CheckCircle,
  MessageCircle,
  Building,
  Percent
} from 'lucide-react';

export default function AdminPortal({ onOpenVendorChat }) {
  const [metrics, setMetrics] = useState({
    totalGMV: 148990,
    platformCommission: 7449.50,
    activeVendors: 5,
    totalOrders: 18,
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* 👑 Super Admin Dark Emerald Header */}
      <div className="bg-[#063F35] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex items-center justify-between">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#C9A86A]/20 text-[#C9A86A] px-3 py-1 rounded-full text-[11px] font-bold border border-[#C9A86A]/30">
            <ShieldCheck size={14} />
            <span>Super Admin Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Marketplace Governance & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-300">
            Real-time platform GMV earnings, vendor verification, and commission escrow settings.
          </p>
        </div>
      </div>

      {/* 📊 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Gross Merchandise Value</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹{metrics.totalGMV.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +18.4% this month
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Net Platform Commission (5%)</span>
          <h3 className="text-2xl font-black text-[#063F35] mt-1">₹{metrics.platformCommission.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-slate-500 block mt-1">Auto-credited from Escrow</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Active Verified Vendors</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{vendors.length || 5} Stores</h3>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <ShieldCheck size={12} /> 100% Verified
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Total Marketplace Orders</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.totalOrders}</h3>
          <span className="text-[10px] text-slate-500 block mt-1">Processed via Stripe</span>
        </div>
      </div>

      {/* 🏬 Verified Merchant Directory */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Store size={18} className="text-[#063F35]" />
              <span>Merchant Store Directory & Escrow Rates</span>
            </h3>
            <p className="text-xs text-slate-500">Manage vendor commission rates and support desk channels</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-2">Store & Owner</th>
                <th className="py-3 px-2">Commission Tier</th>
                <th className="py-3 px-2">Wallet Escrow Balance</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Support Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {vendors.map((v) => (
                <tr key={v._id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-2 flex items-center gap-3">
                    <img src={v.logo || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100'} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900">{v.storeName}</h4>
                      <span className="text-[10px] text-slate-400">{v.user?.email || 'merchant@shopsphere.io'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="bg-emerald-50 text-[#063F35] font-bold px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                      {v.commissionRate || 2.5}% Fee
                    </span>
                  </td>
                  <td className="py-3 px-2 font-bold text-slate-900">
                    ₹{(v.wallet?.availableBalance || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <CheckCircle size={10} /> Verified
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={onOpenVendorChat}
                      className="bg-[#063F35] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl hover:bg-[#0B3D35] transition cursor-pointer inline-flex items-center gap-1"
                    >
                      <MessageCircle size={13} /> Chat HQ
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