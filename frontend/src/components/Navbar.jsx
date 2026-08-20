import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  LogOut,
  Heart,
  ChevronDown,
  User,
  ShieldCheck,
  Store,
  Package,
  Layers,
  Menu,
  X,
  Truck,
  RotateCcw,
  Headphones
} from 'lucide-react';

const CATEGORIES_NAV = [
  { name: 'Electronics', icon: '💻' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Beauty', icon: '🧴' },
  { name: 'Home & Kitchen', icon: '🏠' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Toys & Games', icon: '🧸' },
  { name: 'Books', icon: '📚' },
  { name: 'Accessories', icon: '🕶️' },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenChatDrawer,
  openAuthModal,
  selectedCategory,
  setSelectedCategory,
  wishlistCount = 0
}) {
  const { user, isAuthenticated, isVendor, isAdmin, logout, login } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=063F35&color=fff&bold=true`;

  const handleRoleSwitch = async (role) => {
    try {
      if (role === 'customer') {
        await login('rohan@gmail.com', 'Password@123');
        setActiveTab('catalog');
      } else if (role === 'vendor') {
        await login('techzone@shopsphere.io', 'Password@123');
        setActiveTab('vendor-portal');
      } else if (role === 'admin') {
        await login('admin@shopsphere.io', 'Password@123');
        setActiveTab('admin-portal');
      }
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white font-['Plus_Jakarta_Sans',sans-serif] w-full border-b border-slate-200/80 shadow-xs">

        {/* Top Announcement Bar */}
        <div className="bg-[#0B3D35] text-white text-[11px] px-4 py-1.5 flex items-center justify-between font-medium">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1 opacity-90"><Truck size={12} className="text-[#C9A86A]" /> Free Shipping on orders above ₹499</span>
            <span className="hidden sm:flex items-center gap-1 opacity-90"><ShieldCheck size={12} className="text-[#C9A86A]" /> 100% Secure Payments</span>
            <span className="hidden md:flex items-center gap-1 opacity-90"><RotateCcw size={12} className="text-[#C9A86A]" /> Easy Returns</span>
            <span className="hidden lg:flex items-center gap-1 opacity-90"><Headphones size={12} className="text-[#C9A86A]" /> 24/7 Support</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-200">
            <button onClick={() => handleRoleSwitch('vendor')} className="text-[#C9A86A] font-bold hover:underline cursor-pointer flex items-center gap-1">
              <Store size={11} /> Sell on ShopSphere
            </button>
          </div>
        </div>

        {/* Primary Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }} className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#063F35] text-[#C9A86A] flex items-center justify-center shadow-md shadow-[#063F35]/20 group-hover:scale-105 transition">
              <ShoppingBag size={20} />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-slate-900 flex items-center">
                ShopSphere<span className="text-[#C9A86A]">.</span>
              </span>
              <span className="text-[9px] font-extrabold tracking-wider text-slate-400 block -mt-1 uppercase">
                Marketplace for everyone
              </span>
            </div>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:flex items-center bg-slate-100/90 rounded-2xl border border-slate-200 focus-within:border-[#063F35] focus-within:bg-white transition shadow-2xs overflow-hidden">
            <select
              value={selectedCategory || 'All'}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 px-3 py-2.5 outline-none border-r border-slate-200 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Beauty">Beauty</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
            </select>

            <div className="flex-1 flex items-center px-3">
              <input
                type="text"
                placeholder="Search products, brands and stores..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'catalog') setActiveTab('catalog');
                }}
                className="w-full text-xs bg-transparent py-2.5 text-slate-900 focus:outline-none"
              />
            </div>

            <button className="bg-[#063F35] hover:bg-[#0B3D35] text-white p-2.5 px-4 transition cursor-pointer flex items-center justify-center">
              <Search size={16} />
            </button>
          </div>

          {/* Right Header Links */}
          <div className="hidden md:flex items-center gap-3 shrink-0">

            {/* Wishlist Link */}
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-1.5 text-xs font-bold p-2 px-3 rounded-xl transition cursor-pointer ${
                activeTab === 'wishlist' ? 'bg-[#063F35] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Heart size={18} className={wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'} />
              <span>Wishlist</span>
              {wishlistCount > 0 && <span className="bg-[#C9A86A] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">{wishlistCount}</span>}
            </button>

            {/* Live Chat Link */}
            {isAuthenticated && (
              <button
                onClick={onOpenChatDrawer}
                className="flex items-center gap-1 text-slate-700 hover:text-[#063F35] text-xs font-bold p-2 px-3 rounded-xl hover:bg-slate-100 transition cursor-pointer relative"
              >
                <MessageCircle size={18} className="text-[#063F35]" />
                <span>Chat</span>
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">2</span>
              </button>
            )}

            {/* Cart Link */}
            {!isVendor && !isAdmin && (
              <button
                onClick={() => setActiveTab('cart')}
                className={`flex items-center gap-1.5 text-xs font-bold p-2 px-3 rounded-xl transition cursor-pointer relative ${
                  activeTab === 'cart' ? 'bg-[#063F35] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="relative">
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#C9A86A] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </button>
            )}

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1.5 px-3 rounded-2xl transition cursor-pointer"
                >
                  <img src={user.avatar || getAvatar(user.name)} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-[#063F35]" />
                  <span className="text-xs font-bold text-slate-900 max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
                    <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-xl mb-1">
                      <p className="text-xs font-black text-slate-900">{user.name}</p>
                      <span className="text-[10px] font-bold text-[#063F35] uppercase bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">{user.role} Account</span>
                    </div>

                    <div className="space-y-0.5 text-xs font-bold text-slate-700">
                      {!isVendor && !isAdmin && (
                        <button onClick={() => { setActiveTab('orders'); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-xl flex items-center gap-2 cursor-pointer">
                          <Package size={15} className="text-[#063F35]" /> My Orders & Tracking
                        </button>
                      )}
                      {isVendor && (
                        <button onClick={() => { setActiveTab('vendor-portal'); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-indigo-700 cursor-pointer">
                          <Store size={15} /> Vendor Merchant Portal
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => { setActiveTab('admin-portal'); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-amber-700 cursor-pointer">
                          <ShieldCheck size={15} /> Super Admin Command Center
                        </button>
                      )}
                      <button onClick={() => { setShowProfileModal(true); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-xl flex items-center gap-2 cursor-pointer">
                        <User size={15} /> Edit Profile & Address
                      </button>

                      <div className="pt-2 mt-1 border-t border-slate-100">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 px-3 block mb-1">Switch Demo Persona:</span>
                        <div className="grid grid-cols-3 gap-1 px-1">
                          <button onClick={() => handleRoleSwitch('customer')} className="text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-800 font-bold p-1 rounded-md text-center cursor-pointer">Buyer</button>
                          <button onClick={() => handleRoleSwitch('vendor')} className="text-[10px] bg-slate-100 hover:bg-indigo-100 text-slate-800 font-bold p-1 rounded-md text-center cursor-pointer">Vendor</button>
                          <button onClick={() => handleRoleSwitch('admin')} className="text-[10px] bg-slate-100 hover:bg-amber-100 text-slate-800 font-bold p-1 rounded-md text-center cursor-pointer">Admin</button>
                        </div>
                      </div>

                      {/* 🛡️ Sign Out button opens Permission Confirmation Modal */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl flex items-center gap-2 cursor-pointer mt-2 transition"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => openAuthModal('login')} className="bg-[#063F35] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer">Sign In</button>
            )}
          </div>
        </div>

        {/* Sticky Sub-Header */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 text-xs font-bold text-slate-700 whitespace-nowrap">
            <button onClick={() => setSelectedCategory('All')} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl cursor-pointer ${selectedCategory === 'All' ? 'bg-[#063F35] text-white' : 'bg-slate-900 text-white'}`}>
              <Layers size={14} /> <span>All Categories</span>
            </button>
            {CATEGORIES_NAV.map((cat) => (
              <button key={cat.name} onClick={() => { setSelectedCategory(cat.name); if (activeTab !== 'catalog') setActiveTab('catalog'); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer ${selectedCategory === cat.name ? 'bg-[#063F35] text-white' : 'hover:bg-slate-200/70 text-slate-700'}`}>
                <span>{cat.icon}</span> <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* 🛑 Logout Permission Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 text-slate-400 p-1 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LogOut size={24} />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">Sign Out from ShopSphere?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to end your current session for <strong>{user?.name}</strong>?
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  setActiveTab('catalog');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}