import React from 'react';
import { ShoppingBag, MessageCircle, Star, Store, ShieldCheck } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onOpenChat, onSelect }) {
  // Category-based high quality fallback images
  const getCategoryFallbackImage = (cat) => {
    switch (cat) {
      case 'Beauty & Wellness':
        return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600';
      case 'Fashion & Apparel':
        return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600';
      case 'Home & Kitchen':
        return 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600';
      default:
        return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
    }
  };

  const fallbackImage = getCategoryFallbackImage(product.category);
  const primaryImage = product.images?.[0]?.url || fallbackImage;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice > 0 ? product.price : null;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Box */}
      <div
        onClick={() => onSelect && onSelect(product)}
        className="relative overflow-hidden aspect-square bg-slate-100 cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={product.title}
          onError={(e) => { e.target.src = fallbackImage; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Vendor Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 flex items-center gap-1 shadow-sm border border-slate-200/60">
          <Store size={12} className="text-indigo-600 shrink-0" />
          <span className="truncate max-w-[110px]">{product.vendor?.storeName || 'Verified Merchant'}</span>
        </div>

        {/* Discount Tag */}
        {originalPrice && (
          <div className="absolute top-3 right-3 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide shadow-sm">
            {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>{product.rating || 4.8}</span>
            </div>
          </div>

          <h3
            onClick={() => onSelect && onSelect(product)}
            className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-indigo-600 cursor-pointer transition mt-1"
          >
            {product.title}
          </h3>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-slate-900">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold block">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenChat && onOpenChat(product)}
              title="Chat with Seller"
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition"
            >
              <MessageCircle size={15} />
            </button>

            <button
              type="button"
              onClick={() => onAddToCart && onAddToCart(product)}
              disabled={product.stock <= 0}
              className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-sm shadow-indigo-200 transition disabled:opacity-50"
            >
              <ShoppingBag size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}