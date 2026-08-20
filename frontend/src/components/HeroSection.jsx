import React from 'react';
import { ShoppingBag, Store, ShieldCheck, ArrowRight, Sparkles, Truck } from 'lucide-react';

export default function HeroSection({ onShopNow, onExploreStores }) {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* 🌲 Main Deep Emerald Banner */}
      <div className="lg:col-span-2 bg-[#063F35] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[280px]">
        <div className="space-y-3 relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 bg-[#C9A86A]/20 text-[#C9A86A] px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-[#C9A86A]/30">
            <Sparkles size={13} /> Multi-Vendor Marketplace Platform
          </span>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
            Discover Verified Stores & Premium Quality Goods
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            Shop directly from authentic Indian brands with 256-bit Stripe Escrow protection and fast door delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 relative z-10">
          <button
            onClick={onShopNow}
            className="bg-[#C9A86A] hover:bg-[#D4B67B] text-[#063F35] font-black text-xs px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Products</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={onExploreStores}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-xl border border-white/20 transition cursor-pointer flex items-center gap-2"
          >
            <Store size={15} className="text-[#C9A86A]" />
            <span>Merchant Stores</span>
          </button>
        </div>
      </div>

      {/* 🛡️ Side Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">

        {/* Trust Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#063F35] flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">100% Escrow Protection</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Your payment is held safely until your sub-order is delivered.
            </p>
          </div>
        </div>

        {/* Seller Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Store size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">Become a Merchant</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Register your business storefront and reach customers nationwide.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}