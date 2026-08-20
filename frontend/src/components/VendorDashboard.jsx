import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Store,
  Package,
  DollarSign,
  Plus,
  Truck,
  CheckCircle,
  Clock,
  MessageCircle,
  TrendingUp,
  ShieldCheck,
  Crown
} from 'lucide-react';

export default function VendorDashboard({ onOpenAdminChat }) {
  const [vendor, setVendor] = useState(null);
  const [subOrders, setSubOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  useEffect(() => {
    fetchVendorProfile();
    fetchSubOrders();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      const { data } = await api.get('/vendors/me');
      setVendor(data.vendor);
    } catch (err) {
      console.error('Fetch vendor error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubOrders = async () => {
    try {
      const { data } = await api.get('/orders/vendor-suborders');
      setSubOrders(data.subOrders || []);
    } catch (err) {
      console.error('Fetch sub-orders error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* 🏬 Vendor Header */}
      <div className="bg-[#063F35] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <img
            src={vendor?.logo || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200'}
            alt="Store Logo"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C9A86A]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{vendor?.storeName || 'TechZone Hub'}</h1>
              <span className="bg-[#C9A86A]/20 text-[#C9A86A] border border-[#C9A86A]/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} /> FEE: {vendor?.commissionRate || 2.5}%
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{vendor?.description || 'Authorized merchant storefront.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdminChat}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <MessageCircle size={15} className="text-[#C9A86A]" />
            <span>Contact Admin Desk</span>
          </button>
        </div>
      </div>

      {/* Wallet Escrow Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Pending Escrow</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹{(vendor?.wallet?.pendingBalance || 24365).toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-slate-400 block mt-1">Held until customer delivery</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Available for Payout</span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">₹{(vendor?.wallet?.availableBalance || 12500).toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Ready to withdraw to bank</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">Active Products</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">2 Listed Items</h3>
          <span className="text-[10px] text-slate-400 block mt-1">Live on marketplace</span>
        </div>
      </div>

    </div>
  );
}