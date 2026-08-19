import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShoppingBag,
  MessageCircle,
  Star,
  Sparkles,
  SlidersHorizontal,
  Store,
  Check
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion & Apparel',
  'Beauty & Wellness',
  'Home & Kitchen',
];

export default function ProductGrid({ searchQuery = '', onAddToCart, onOpenChat }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [addedIds, setAddedIds] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (sortBy) params.sort = sortBy;

      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (product) => {
    onAddToCart(product);
    setAddedIds((prev) => [...prev, product._id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product._id));
    }, 1200);
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor?.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* 🚀 Hero Banner (100% Full-Width Responsive) */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-[11px] font-bold border border-indigo-500/30">
            <Sparkles size={13} />
            <span>Multi-Vendor SaaS Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            Discover Verified Merchants & Handcrafted Brands
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Single checkout across multiple sellers with automated escrow, real-time fulfillment, and instant live chat.
          </p>
        </div>
      </div>

      {/* 🏷️ Filter Chips & Sorting Row */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">

        {/* Category Pills (Smooth Horizontal Touch Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] pb-1 sm:pb-0 w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Customer Rated</option>
          </select>
        </div>
      </div>

      {/* 📦 Product Grid (100% Full-Width Mobile Cards) */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading marketplace catalog...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {filteredProducts.map((product) => {
            const isAdded = addedIds.includes(product._id);
            const discountPct = product.discountPrice > 0
              ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
              : 0;

            const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

            return (
              <div
                key={product._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group w-full"
              >
                {/* Image Container */}
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Store Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold text-slate-800 flex items-center gap-1 shadow-xs border border-white/60">
                    <Store size={12} className="text-indigo-600" />
                    <span>{product.vendor?.storeName || 'Merchant'}</span>
                  </div>

                  {/* Discount Badge */}
                  {discountPct > 0 && (
                    <span className="absolute top-3 right-3 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="uppercase font-bold tracking-wider text-indigo-600">{product.category}</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={12} className="fill-amber-400" />
                        {product.rating || 4.8}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-slate-900">
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>
                        {product.discountPrice > 0 && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Live Chat with Seller */}
                      <button
                        onClick={() => onOpenChat(product)}
                        title="Chat with seller"
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition cursor-pointer"
                      >
                        <MessageCircle size={16} />
                      </button>

                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddClick(product)}
                        disabled={product.stock === 0}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-sm ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        }`}
                      >
                        {isAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
                        <span>{isAdded ? 'Added' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <ShoppingBag size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-400 mt-1">Try searching for different keywords or select another category.</p>
        </div>
      )}
    </div>
  );
}