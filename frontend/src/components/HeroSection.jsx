import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Truck,
  RotateCcw,
  Headphones,
  Store,
  ArrowRight
} from 'lucide-react';

export default function HeroSection({ onShopNow, onExploreStores }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* 🌟 Left Side: Deep Emerald Hero Banner (2/3 width) */}
      <div className="lg:col-span-2 bg-gradient-to-tr from-[#063F35] via-[#0B3D35] to-[#063F35] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[320px] sm:min-h-[360px]">

        {/* Ambient Gold Particle Effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A86A]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#C9A86A]/20 text-[#C9A86A] px-3.5 py-1 rounded-full text-[11px] font-bold border border-[#C9A86A]/30">
            <Sparkles size={13} />
            <span>Multi-Vendor Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Shop authentic. <br />
            <span className="text-[#C9A86A]">Support local.</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Explore verified sellers, quality handcrafted products, and trusted brands across multiple categories.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onShopNow}
              className="bg-[#C9A86A] hover:bg-[#D4B67B] text-[#063F35] font-black text-xs px-6 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={onExploreStores}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3.5 rounded-xl border border-white/20 transition cursor-pointer"
            >
              Explore Stores
            </button>
          </div>
        </div>

        {/* 3D Product Pedestal Showcase Visual */}
        <div className="hidden sm:block absolute right-4 bottom-4 w-72 h-72 opacity-95 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
            alt="Product Showcase"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* 🛡️ Right Side: Stacked Trust & Seller Cards (1/3 width) */}
      <div className="space-y-4 flex flex-col justify-between">

        {/* Why ShopSphere? Trust Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-slate-900 flex items-center justify-between">
            <span>Why ShopSphere?</span>
            <ShieldCheck size={18} className="text-[#063F35]" />
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-emerald-50 text-[#063F35] rounded-lg mt-0.5">
                <ShieldCheck size={14} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Verified Sellers</h4>
                <p className="text-[10px] text-slate-500">Trusted & quality products</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-emerald-50 text-[#063F35] rounded-lg mt-0.5">
                <Lock size={14} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Secure Payments</h4>
                <p className="text-[10px] text-slate-500">100% protected transactions</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-emerald-50 text-[#063F35] rounded-lg mt-0.5">
                <Truck size={14} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Fast Delivery</h4>
                <p className="text-[10px] text-slate-500">Across verified sellers</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-emerald-50 text-[#063F35] rounded-lg mt-0.5">
                <RotateCcw size={14} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Easy Returns</h4>
                <p className="text-[10px] text-slate-500">Hassle-free returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Become a Seller Banner Card */}
        <div className="bg-[#063F35] text-white rounded-3xl p-5 border border-[#063F35] shadow-xs relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h4 className="text-xs font-black uppercase text-[#C9A86A] tracking-wider flex items-center gap-1">
              <Store size={14} /> Become a Seller
            </h4>
            <h3 className="text-sm font-bold text-white">Grow your business with ShopSphere</h3>
            <p className="text-[11px] text-slate-300">Reach more customers with powerful store tools.</p>
            <button
              onClick={onExploreStores}
              className="bg-[#C9A86A] hover:bg-[#D4B67B] text-[#063F35] text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer mt-1"
            >
              Start Selling
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}