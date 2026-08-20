import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Store, Star, CheckCircle } from 'lucide-react';

export default function FeaturedStores({ onSelectStore }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vendors');
      const verifiedOnly = data.vendors?.filter((v) => v.isVerified || v.vendorStatus === 'approved') || [];
      setStores(verifiedOnly);
    } catch (err) {
      console.error('Fetch featured stores error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Store size={20} className="text-[#063F35]" />
            <span>Featured Merchant Stores</span>
          </h2>
          <p className="text-xs text-slate-500">Explore top-rated verified brand storefronts</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading verified stores...</div>
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {stores.map((store) => (
            <div
              key={store._id}
              onClick={() => onSelectStore(store.storeName)}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-md transition duration-300 cursor-pointer flex flex-col items-center text-center space-y-2 group"
            >
              <div className="relative">
                <img
                  src={store.logo || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200'}
                  alt={store.storeName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                  <CheckCircle size={10} />
                </span>
              </div>

              <div className="w-full">
                <h4 className="font-black text-xs text-slate-900 truncate group-hover:text-[#063F35] transition">
                  {store.storeName}
                </h4>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                  {store.description || 'Verified Seller'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-[10px] font-bold text-slate-700 flex items-center gap-1">
                <Star size={11} className="text-amber-500 fill-amber-400" />
                <span>4.9 Rating</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-slate-400 text-xs">No verified stores listed.</div>
      )}
    </div>
  );
}