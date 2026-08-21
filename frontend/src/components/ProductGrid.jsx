import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import HeroSection from './HeroSection';
import FeaturedStores from './FeaturedStores';
import DealsOfTheDay from './DealsOfTheDay';
import {
  ShoppingBag,
  MessageCircle,
  Star,
  Heart,
  ShieldCheck,
  Check,
  Package,
  X
} from 'lucide-react';

export default function ProductGrid({
  searchQuery = '',
  selectedCategory = 'All',
  onAddToCart,
  onToggleWishlist,
  wishlistItems = [],
  onOpenChat,
  setActiveTab
}) {
  const { isVendor, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState([]);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    const pId = product._id || product.id;
    setAddedIds((prev) => [...prev, pId]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== pId)), 1200);
  };

  const handleWishlistClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendor?.storeName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStore = selectedStoreFilter
      ? p.vendor?.storeName?.toLowerCase() === selectedStoreFilter.toLowerCase()
      : true;

    return matchesSearch && matchesStore;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Hero Section */}
      <HeroSection
        onShopNow={() => {}}
        onExploreStores={() => setActiveTab?.('vendor-portal')}
      />

      {/* Deals of the Day */}
      <DealsOfTheDay onShopNow={() => {}} />

      {/* Dynamic Featured Stores */}
      <FeaturedStores onSelectStore={(storeName) => setSelectedStoreFilter(storeName)} />

      {/* Trending Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Package size={20} className="text-[#063F35]" />
                <span>
                  {selectedStoreFilter ? `Products from "${selectedStoreFilter}"` : 'Trending Products'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">Quality verified products from merchants across India</p>
            </div>

            {selectedStoreFilter && (
              <button
                onClick={() => setSelectedStoreFilter('')}
                className="bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1 cursor-pointer hover:bg-rose-100 transition"
              >
                <X size={13} /> Clear Store Filter
              </button>
            )}
          </div>

          <span className="text-xs font-bold text-[#063F35] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {filteredProducts.length} Products Found
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading marketplace catalog...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 w-full">
            {filteredProducts.map((product) => {
              const pId = product._id || product.id;
              const isAdded = addedIds.includes(pId);
              const isWished = wishlistItems.some((w) => (w._id || w.id || w) === pId);

              const discountPct = product.discountPrice > 0
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0;
              const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

              return (
                <div
                  key={pId}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group w-full relative"
                >
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {discountPct > 0 && (
                      <span className="absolute top-2 left-2 bg-rose-500 text-white px-1.5 py-0.5 rounded-md text-[9px] font-black shadow-2xs">
                        -{discountPct}%
                      </span>
                    )}

                    {/* ❤️ Wishlist Heart */}
                    {!isVendor && !isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleWishlistClick(e, product)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-500 transition cursor-pointer shadow-xs z-10"
                        title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart size={15} className={isWished ? 'fill-rose-500 text-rose-500' : ''} />
                      </button>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate mb-0.5">
                        <span>{product.vendor?.storeName || 'Merchant'}</span>
                        <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
                      </span>

                      <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                        {product.title}
                      </h3>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star size={11} className="fill-amber-400" /> {product.rating || 4.8}
                        </span>
                        <span>(124)</span>
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-slate-900">
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>
                        {product.discountPrice > 0 && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 🛒 Bottom Actions */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {!isVendor && !isAdmin ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onOpenChat) onOpenChat(product);
                            }}
                            title={`Chat with ${product.vendor?.storeName || 'seller'}`}
                            className="p-2 text-slate-500 hover:text-[#063F35] hover:bg-emerald-50 border border-slate-200 rounded-xl transition cursor-pointer"
                          >
                            <MessageCircle size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleAddClick(e, product)}
                            className={`flex-1 text-[11px] font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                              isAdded
                                ? 'bg-emerald-700 text-white'
                                : 'bg-[#063F35] hover:bg-[#0B3D35] text-white shadow-xs'
                            }`}
                          >
                            {isAdded ? <Check size={13} /> : <ShoppingBag size={13} />}
                            <span>{isAdded ? 'Added' : 'Add'}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenChat && onOpenChat(product)}
                          className="w-full bg-[#063F35] hover:bg-[#0B3D35] text-white text-[11px] font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <MessageCircle size={14} />
                          <span>Contact Seller</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
            <Package size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products found</h3>
          </div>
        )}
      </div>

    </div>
  );
}