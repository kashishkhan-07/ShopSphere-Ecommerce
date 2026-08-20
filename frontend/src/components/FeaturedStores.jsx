import React from 'react';
import { Store, Star, ArrowRight, ShieldCheck } from 'lucide-react';

const STORES = [
  {
    id: 1,
    name: 'TechZone Hub',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200',
    rating: 4.9,
    productsCount: 245,
    category: 'Electronics & Audio',
  },
  {
    id: 2,
    name: 'Urban Nest',
    logo: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=200',
    rating: 4.8,
    productsCount: 199,
    category: 'Home & Kitchenware',
  },
  {
    id: 3,
    name: 'Aura Beauty',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200',
    rating: 4.9,
    productsCount: 156,
    category: 'Skincare & Cosmetics',
  },
  {
    id: 4,
    name: 'StyleCrafts',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
    rating: 4.7,
    productsCount: 118,
    category: 'Apparel & Accessories',
  },
];

export default function FeaturedStores({ onSelectStore }) {
  return (
    <div className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Store size={20} className="text-[#063F35]" />
            <span>Featured Stores</span>
          </h2>
          <p className="text-xs text-slate-500">Discover top verified sellers & brand storefronts</p>
        </div>
        <button
          onClick={onSelectStore}
          className="text-xs font-bold text-[#063F35] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All Stores</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {STORES.map((store) => (
          <div
            key={store.id}
            onClick={onSelectStore}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group"
          >
            <img
              src={store.logo}
              alt={store.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 group-hover:scale-105 transition"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                <span>{store.name}</span>
                <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
              </h4>
              <p className="text-[10px] text-slate-400 truncate">{store.category}</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 mt-1">
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star size={11} className="fill-amber-400" /> {store.rating}
                </span>
                <span>• {store.productsCount} Products</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}