import React, { useState, useEffect } from 'react';
import { Flame, Clock, Star } from 'lucide-react';

const FLASH_DEALS = [
  {
    id: 'd1',
    title: 'Smart Watch Series 8 Pro',
    store: 'Chronos Time',
    originalPrice: 4699,
    flashPrice: 3299,
    discountPct: 30,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  },
  {
    id: 'd2',
    title: 'Genuine Leather Wallet',
    store: 'StyleCraft',
    originalPrice: 2499,
    flashPrice: 1699,
    discountPct: 32,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
  },
  {
    id: 'd3',
    title: 'Studio Wireless Headphones',
    store: 'VoltGear',
    originalPrice: 5999,
    flashPrice: 3999,
    discountPct: 33,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  },
  {
    id: 'd4',
    title: 'Luxury Oud Perfume 100ml',
    store: 'Aura Beauty',
    originalPrice: 2999,
    flashPrice: 1999,
    discountPct: 33,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400',
  },
];

export default function DealsOfTheDay({ onShopNow }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#FBF9F4] rounded-2xl border border-amber-900/10 p-3.5 sm:p-4 shadow-2xs font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Compact Header */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-900/10 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
            <Flame size={14} />
          </div>
          <h3 className="font-extrabold text-xs text-slate-900">Deals of the Day</h3>
          <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
            Limited
          </span>
        </div>

        {/* Compact Digital Timer */}
        <div className="bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 text-slate-700">
          <Clock size={11} className="text-[#063F35]" />
          <span className="text-[#063F35] font-mono font-bold tracking-tight">
            {String(timeLeft.hours).padStart(2, '0')}h:{String(timeLeft.minutes).padStart(2, '0')}m:{String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* 4 Cards Grid - FULL & CLEAR PRODUCT VISIBILITY (object-contain) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FLASH_DEALS.map((deal) => (
          <div
            key={deal.id}
            onClick={onShopNow}
            className="bg-white rounded-xl border border-slate-200/70 p-2.5 hover:shadow-xs transition duration-200 flex flex-col justify-between space-y-2 group cursor-pointer relative"
          >
            {/* Image Container with object-contain for 100% Full Visibility */}
            <div className="relative h-28 sm:h-32 w-full rounded-lg bg-slate-50 overflow-hidden flex items-center justify-center p-1.5 border border-slate-100">
              <img
                src={deal.image}
                alt={deal.title}
                className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                }}
              />
              <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-xs">
                -{deal.discountPct}%
              </span>
            </div>

            {/* Product Info */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[9px] text-slate-400">
                <span className="text-[#063F35] font-bold truncate max-w-[90px]">{deal.store}</span>
                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <Star size={9} className="fill-amber-400" /> {deal.rating}
                </span>
              </div>

              <h4 className="font-bold text-[11px] text-slate-900 truncate group-hover:text-[#063F35]">
                {deal.title}
              </h4>

              <div className="flex items-baseline gap-1.5 pt-0.5">
                <span className="text-xs font-black text-[#063F35]">
                  ₹{deal.flashPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 line-through">
                  ₹{deal.originalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Minimal Small Button */}
            <button
              className="w-full bg-[#063F35] hover:bg-[#0B3D35] text-white font-bold text-[10px] py-1 rounded-lg transition"
            >
              Claim Deal
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}