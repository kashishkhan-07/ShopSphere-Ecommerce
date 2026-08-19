import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  LogOut,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  Store
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenChatDrawer,
  openAuthModal,
}) {
  const { user, isAuthenticated, isVendor, isAdmin, logout, login } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff&bold=true`;

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
      setMobileMenuOpen(false);
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 font-['Plus_Jakarta_Sans',sans-serif] w-full">

        {/* ⚡ Top Persona Switcher Bar */}
        <div className="bg-slate-900 text-white text-[11px] px-4 py-1.5 flex items-center justify-between overflow-x-auto [scrollbar-width:none]">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" /> SWITCH PERSONA:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleRoleSwitch('customer')}
                className={`px-2.5 py-0.5 rounded-md font-bold transition cursor-pointer ${
                  !isVendor && !isAdmin && isAuthenticated
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🛍️ Customer (Rohan)
              </button>
              <button
                onClick={() => handleRoleSwitch('vendor')}
                className={`px-2.5 py-0.5 rounded-md font-bold transition cursor-pointer ${
                  isVendor
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🏬 Vendor (TechZone)
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`px-2.5 py-0.5 rounded-md font-bold transition cursor-pointer ${
                  isAdmin
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                👑 Super Admin
              </button>
            </div>
          </div>

          <span className="text-slate-400 text-[10px] hidden md:inline">
            ShopSphere Multi-Tenant Cloud Architecture
          </span>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* 🌟 Exact Match Logo from Your Screenshot 🌟 */}
          <button
            onClick={() => {
              setActiveTab('catalog');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 text-left group cursor-pointer shrink-0"
          >
            {/* Glowing Gradient Squircle Orbit Icon */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="2.5" fill="#38bdf8" stroke="#38bdf8" />
                <path d="M12 2a10 10 0 1 0 10 10" stroke="url(#swirlGrad)" strokeWidth="2.2" />
                <path d="M12 6a6 6 0 1 0 6 6" stroke="#ffffff" strokeWidth="1.8" />
                <defs>
                  <linearGradient id="swirlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#e879f9" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Typography with Cyan Dot */}
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center leading-none">
                Shop<span className="text-indigo-600">Sphere</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 ml-0.5 inline-block shadow-xs shadow-cyan-300"></span>
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mt-0.5">
                MARKETPLACE CLOUD
              </span>
            </div>
          </button>

          {/* Search Bar Pill */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <Search size={16} className="absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search products across all stores..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'catalog') setActiveTab('catalog');
              }}
              className="w-full text-xs bg-slate-100/80 focus:bg-white border border-transparent focus:border-indigo-500 rounded-full pl-10 pr-4 py-2.5 focus:outline-none transition shadow-2xs"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'catalog' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Marketplace
            </button>

            {/* Customer Orders */}
            {isAuthenticated && !isVendor && !isAdmin && (
              <button
                onClick={() => setActiveTab('orders')}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === 'orders' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Orders
              </button>
            )}

            {/* Vendor Portal */}
            {isVendor && (
              <button
                onClick={() => setActiveTab('vendor-portal')}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === 'vendor-portal' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                🏬 Vendor Portal
              </button>
            )}

            {/* 👑 Super Admin Desk */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin-portal')}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs ${
                  activeTab === 'admin-portal'
                    ? 'bg-amber-500 text-white font-extrabold shadow-amber-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                👑 Admin Desk
              </button>
            )}

            {/* 💬 Live Chat */}
            {isAuthenticated && (
              <button
                onClick={onOpenChatDrawer}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                title="Open Live Chat Messenger"
              >
                <MessageCircle size={15} className="text-indigo-600" />
                <span>Live Chat</span>
              </button>
            )}

            {/* 🛒 Shopping Cart (With Purple Count Badge from Screenshot) */}
            {!isVendor && !isAdmin && (
              <button
                onClick={() => setActiveTab('cart')}
                className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="View Shopping Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Sign In */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1.5 px-2.5 rounded-2xl transition cursor-pointer"
                  title="Edit Profile"
                >
                  <img
                    src={user.avatar || getAvatar(user.name)}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-indigo-200"
                  />
                  <span className="text-xs font-bold text-slate-900 max-w-[90px] truncate">
                    {user.name}
                  </span>
                </button>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Right */}
          <div className="flex md:hidden items-center gap-2">
            {!isVendor && !isAdmin && (
              <button onClick={() => setActiveTab('cart')} className="relative p-2 text-slate-700">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-700">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }} className="p-2.5 text-xs font-bold bg-indigo-50 text-indigo-600 rounded-xl">Marketplace</button>
              {isAuthenticated && (
                <button onClick={() => { onOpenChatDrawer(); setMobileMenuOpen(false); }} className="p-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl">Live Chat</button>
              )}
            </div>

            {isAdmin && (
              <button onClick={() => { setActiveTab('admin-portal'); setMobileMenuOpen(false); }} className="w-full bg-amber-50 text-amber-800 text-xs font-bold py-2.5 rounded-xl border border-amber-200">
                👑 Super Admin Headquarters
              </button>
            )}

            {isVendor && (
              <button onClick={() => { setActiveTab('vendor-portal'); setMobileMenuOpen(false); }} className="w-full bg-indigo-50 text-indigo-700 text-xs font-bold py-2.5 rounded-xl border border-indigo-200">
                🏬 Vendor Portal
              </button>
            )}

            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <img src={user.avatar || getAvatar(user.name)} className="w-7 h-7 rounded-full object-cover" />
                  <span>{user.name}</span>
                </button>
                <button onClick={() => { setMobileMenuOpen(false); setShowLogoutConfirm(true); }} className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => { setMobileMenuOpen(false); openAuthModal('login'); }} className="w-full bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl">
                Sign In
              </button>
            )}
          </div>
        )}
      </header>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Logout Confirmation Permission Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center relative">
            <button onClick={() => setShowLogoutConfirm(false)} className="absolute top-4 right-4 text-slate-400">
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
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100">
                Cancel
              </button>
              <button onClick={() => { setShowLogoutConfirm(false); logout(); setActiveTab('catalog'); }} className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 shadow-md">
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}