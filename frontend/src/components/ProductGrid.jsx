import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from './ProductCard';
import { SlidersHorizontal, PackageX, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Beauty & Health',
  'Accessories',
];

export default function ProductGrid({ searchQuery, onAddToCart, onOpenChat, onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortOption]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?sort=${sortOption}`;
      if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (searchQuery) url += `&keyword=${encodeURIComponent(searchQuery)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 mb-8 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            <span>Discover Verified Merchants</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
            Shop from Multiple Independent Vendors in One Cart.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Real-time merchant support, AI assistance, instant order splitting, and seamless Stripe checkout.
          </p>
        </div>
      </div>

      {/* Category Pills & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-400" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={onAddToCart}
              onOpenChat={onOpenChat}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <PackageX size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try searching for another keyword or selecting another category.
          </p>
        </div>
      )}
    </div>
  );
}