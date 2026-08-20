import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';

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
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50/50 rounded-3xl p-5 border border-amber-200/60 shadow-2xs font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Flame size={22} />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <span>Deals of the Day</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">Limited Time</span>
            </h3>
            <p className="text-xs text-slate-500">Massive price drops from verified merchants</p>
          </div>
        </div>

        {/* Real-time Countdown Timer */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Clock size={16} className="text-slate-600" />
          <div className="flex items-center gap-1 text-xs font-black font-mono">
            <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span>:</span>
            <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span>:</span>
            <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>

          <button
            onClick={onShopNow}
            className="ml-3 bg-[#063F35] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#0B3D35] transition cursor-pointer flex items-center gap-1"
          >
            <span>View All Deals</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}