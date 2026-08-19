import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  LogOut,
  User,
  ShieldCheck,
  Store,
  Package,
  Sparkles,
  Menu,
  X,
  ChevronRight
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 font-['Plus_Jakarta_Sans',sans-serif] w-full max-w-full">

        {/* ⚡ Top Persona Switcher Bar */}
        <div className="bg-slate-900 text-white text-[11px] px-3 sm:px-6 py-1.5 flex items-center justify-between overflow-x-auto [scrollbar-width:none]">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider hidden sm:flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" /> Persona:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleRoleSwitch('customer')}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] sm:text-xs transition ${
                  !isVendor && !isAdmin && isAuthenticated
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🛍️ Buyer
              </button>
              <button
                onClick={() => handleRoleSwitch('vendor')}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] sm:text-xs transition ${
                  isVendor
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🏬 Vendor
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] sm:text-xs transition ${
                  isAdmin
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                👑 Admin
              </button>
            </div>
          </div>

          <span className="text-slate-400 text-[10px] hidden lg:inline">
            ShopSphere Multi-Tenant Cloud
          </span>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">

          {/* Logo */}
          <button
            onClick={() => {
              setActiveTab('catalog');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 text-left group cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition">
              <Package size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 flex items-center">
                ShopSphere<span className="text-indigo-600">.</span>
              </span>
            </div>
          </button>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search products across all stores..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'catalog') setActiveTab('catalog');
              }}
              className="w-full text-xs bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none transition"
            />
          </div>

          {/* Desktop Right Links */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`text-xs font-bold px-3 py-2 rounded-xl transition ${
                activeTab === 'catalog' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Marketplace
            </button>

            {isAuthenticated && !isVendor && !isAdmin && (
              <button
                onClick={() => setActiveTab('orders')}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition ${
                  activeTab === 'orders' ? 'bg-slate-100 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Orders
              </button>
            )}

            {isVendor && (
              <button
                onClick={() => setActiveTab('vendor-portal')}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition ${
                  activeTab === 'vendor-portal' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                🏬 Vendor Portal
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin-portal')}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition ${
                  activeTab === 'admin-portal' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                👑 Admin Desk
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={onOpenChatDrawer}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <MessageCircle size={15} className="text-indigo-600" />
                <span>Live Chat</span>
              </button>
            )}

            {!isVendor && !isAdmin && (
              <button
                onClick={() => setActiveTab('cart')}
                className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1.5 px-2.5 rounded-2xl transition cursor-pointer"
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* 📱 Mobile Right Header Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            {!isVendor && !isAdmin && (
              <button
                onClick={() => setActiveTab('cart')}
                className="relative p-2 text-slate-700"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute 0 top-0 right-0 bg-indigo-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={onOpenChatDrawer}
                className="p-2 text-indigo-600"
              >
                <MessageCircle size={20} />
              </button>
            )}

            {/* Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-indigo-600 rounded-xl"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* 📱 Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-in slide-in-from-top-3">

            {/* Search Input for Mobile */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'catalog') setActiveTab('catalog');
                }}
                className="w-full text-xs bg-slate-100 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setActiveTab('catalog');
                  setMobileMenuOpen(false);
                }}
                className={`text-xs font-bold p-2.5 rounded-xl text-center ${
                  activeTab === 'catalog' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Marketplace
              </button>

              {isAuthenticated && !isVendor && !isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs font-bold p-2.5 rounded-xl text-center ${
                    activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  My Orders
                </button>
              )}

              {isVendor && (
                <button
                  onClick={() => {
                    setActiveTab('vendor-portal');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs font-bold p-2.5 rounded-xl text-center col-span-2 ${
                    activeTab === 'vendor-portal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  🏬 Vendor Merchant Portal
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab('admin-portal');
                    setMobileMenuOpen(false);
                  }}
                  className={`text-xs font-bold p-2.5 rounded-xl text-center col-span-2 ${
                    activeTab === 'admin-portal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  👑 Super Admin Headquarters
                </button>
              )}
            </div>

            {/* Profile / Auth Bar in Mobile Menu */}
            {isAuthenticated ? (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5"
                >
                  <img
                    src={user.avatar || getAvatar(user.name)}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase block">{user.role}</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full bg-indigo-600 text-white text-xs font-bold py-3 rounded-xl shadow-md"
              >
                Sign In / Register
              </button>
            )}
          </div>
        )}
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 text-slate-400 p-1"
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
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  setActiveTab('catalog');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md"
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