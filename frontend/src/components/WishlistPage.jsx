import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistPage({ wishlistItems = [], onAddToCart, onRemoveFromWishlist, onContinueShopping }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Heart size={24} className="text-rose-500 fill-rose-500" />
            <span>My Wishlist ({wishlistItems.length} Items Saved)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your saved favorite items from verified marketplace sellers.
          </p>
        </div>

        <button
          onClick={onContinueShopping}
          className="text-xs font-bold text-[#063F35] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Wishlist Grid */}
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {wishlistItems.map((product) => {
            const price = product.discountPrice > 0 ? product.discountPrice : product.price;
            const imgUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col justify-between group relative"
              >
                {/* Image */}
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <button
                    onClick={() => onRemoveFromWishlist(product._id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 transition shadow-xs cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block truncate">
                      {product.vendor?.storeName || 'Verified Merchant'}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                      {product.title}
                    </h4>
                  </div>

                  <div>
                    <span className="text-sm font-black text-slate-900 block">
                      ₹{price.toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={() => {
                        onAddToCart(product);
                        onRemoveFromWishlist(product._id);
                      }}
                      className="w-full mt-2 bg-[#063F35] hover:bg-[#0B3D35] text-white text-[11px] font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <ShoppingBag size={13} />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <Heart size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Click the heart icon on any product card to save your favorite items for later.
          </p>
          <button
            onClick={onContinueShopping}
            className="bg-[#063F35] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
          >
            Explore Marketplace Catalog
          </button>
        </div>
      )}
    </div>
  );
}