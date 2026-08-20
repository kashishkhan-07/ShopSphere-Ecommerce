import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight, Star } from 'lucide-react';

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
    <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-2xs space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Header & Countdown Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-slate-900">Deals of the Day</h3>
            <span className="text-[10px] text-slate-400 block">Limited period flash discounts</span>
          </div>
        </div>

        {/* Timer Pill */}
        <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-2xl text-xs font-black">
          <Clock size={13} />
          <span>
            {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
          </span>
        </div>
      </div>

    </div>
  );
}