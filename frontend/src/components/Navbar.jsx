import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Search,
  Store,
  ShieldCheck,
  LogOut,
  Layers,
  ChevronDown,
  AlertTriangle,
  X,
  Menu,
  Package
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, searchQuery, setSearchQuery, cartCount, openAuthModal }) {
  const { user, logout, demoLogin, isAuthenticated, isAdmin, isVendor } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true`;

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    setMobileMenuOpen(false);
    logout();
    setActiveTab('catalog');
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full">
        {/* Top Demo Role Switcher Bar */}
        <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 flex justify-between items-center w-full">
          <div className="flex items-center gap-1.5 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="truncate">ShopSphere Multi-Vendor Live</span>
          </div>

          {/* 1-Click Role Switcher */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium px-2 py-0.5 rounded border border-slate-700 transition text-[11px]"
            >
              <span className="max-w-[120px] sm:max-w-none truncate">
                {user ? `${user.role.toUpperCase()}: ${user.name}` : 'Role: Guest'}
              </span>
              <ChevronDown size={12} />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-1 w-60 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1 text-slate-400 border-b border-slate-700 font-semibold uppercase text-[10px]">
                  1-Click Role Switch
                </div>
                <button
                  onClick={() => { demoLogin('customer'); setShowDemoMenu(false); handleTabClick('catalog'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-emerald-300 flex items-center justify-between"
                >
                  <span>🛍️ Customer (Rohan)</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 rounded">Buyer</span>
                </button>
                <button
                  onClick={() => { demoLogin('vendor'); setShowDemoMenu(false); handleTabClick('vendor-portal'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-indigo-300 flex items-center justify-between"
                >
                  <span>🏬 Vendor (TechZone)</span>
                  <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1 rounded">Seller</span>
                </button>
                <button
                  onClick={() => { demoLogin('admin'); setShowDemoMenu(false); handleTabClick('admin-portal'); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-amber-300 flex items-center justify-between"
                >
                  <span>👑 Super Admin</span>
                  <span className="text-[9px] bg-amber-950 text-amber-400 px-1 rounded">Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Navbar Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <div
            onClick={() => handleTabClick('catalog')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Layers size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                Shop<span className="text-indigo-600">Sphere</span>
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden lg:block mx-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                placeholder="Search products across all stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-transparent focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => handleTabClick('catalog')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === 'catalog'
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Marketplace
            </button>

            {isAuthenticated && (
              <button
                onClick={() => handleTabClick('orders')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                  activeTab === 'orders'
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Package size={15} />
                <span>My Orders</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!isAuthenticated) openAuthModal('vendor');
                else handleTabClick('vendor-portal');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === 'vendor-portal'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store size={15} />
              <span>{isVendor ? 'Vendor Portal' : 'Sell with Us'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleTabClick('admin-portal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                  activeTab === 'admin-portal'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <ShieldCheck size={15} />
                <span>Admin</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => handleTabClick('cart')}
              className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth / Avatar */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={user.avatar || fallbackAvatar}
                  alt={user.name}
                  onError={(e) => { e.target.src = fallbackAvatar; }}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => handleTabClick('cart')}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-lg">
            <button
              onClick={() => handleTabClick('catalog')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                activeTab === 'catalog' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 bg-slate-50'
              }`}
            >
              🛍️ Explore Marketplace
            </button>

            {isAuthenticated && (
              <button
                onClick={() => handleTabClick('orders')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  activeTab === 'orders' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 bg-slate-50'
                }`}
              >
                📦 My Orders & Tracking
              </button>
            )}

            <button
              onClick={() => {
                if (!isAuthenticated) openAuthModal('vendor');
                else handleTabClick('vendor-portal');
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                activeTab === 'vendor-portal' ? 'bg-indigo-600 text-white' : 'text-slate-700 bg-slate-50'
              }`}
            >
              🏬 {isVendor ? 'Vendor Portal & Inventory' : 'Become a Merchant'}
            </button>
          </div>
        )}
      </header>

      {/* ⚠️ Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Sign Out Confirmation</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to log out from <strong>{user?.name}</strong>?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition"
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