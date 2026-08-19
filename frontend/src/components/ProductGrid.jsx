import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductCard from './ProductCard';
import { Sparkles, SlidersHorizontal, PackageSearch } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Beauty & Wellness',
];

export default function ProductGrid({ searchQuery, onAddToCart, onOpenChat, onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { sort: sortBy };
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md border border-indigo-500/30">
            <Sparkles size={14} className="text-amber-400" />
            <span>Multi-Vendor SaaS Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Discover Verified Merchants & Handcrafted Brands
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Single checkout across multiple sellers with automated escrow, real-time fulfillment, and instant live chat.
          </p>
        </div>
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <SlidersHorizontal size={15} className="text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse space-y-3">
              <div className="w-full h-48 bg-slate-200 rounded-2xl"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={onAddToCart}
              onOpenChat={onOpenChat}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <PackageSearch size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No products found in "{selectedCategory}"</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Try selecting "All" or searching for a different item name.</p>
          <button
            onClick={() => { setSelectedCategory('All'); }}
            className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}