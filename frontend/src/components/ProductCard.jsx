import React from 'react';
import { Star, Store, ShieldCheck, ShoppingCart, MessageSquare } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onOpenChat, onSelectProduct }) {
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayPrice = product.discountPrice || product.price;
  const primaryImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Box */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Category Pill */}
        <span className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full">
          {product.category}
        </span>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor Identifier Badge */}
          {product.vendor && (
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mb-1.5">
              <Store size={13} />
              <span className="truncate">{product.vendor.storeName}</span>
              {product.vendor.isVerified && (
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" title="Verified Merchant" />
              )}
            </div>
          )}

          {/* Product Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-indigo-600 cursor-pointer transition mb-2"
          >
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-amber-500 mb-3">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700">{product.rating || '4.8'}</span>
            <span className="text-slate-400 text-[11px]">({product.numReviews || 12})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {product.discountPrice > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenChat(product)}
              title="Chat with Vendor"
              className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition"
            >
              <MessageSquare size={16} />
            </button>

            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stock <= 0}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-indigo-100 transition"
            >
              <ShoppingCart size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}