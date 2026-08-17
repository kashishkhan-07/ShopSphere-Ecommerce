import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Search,
  Store,
  ShieldCheck,
  LogOut,
  Layers,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, searchQuery, setSearchQuery, cartCount, openAuthModal }) {
  const { user, logout, demoLogin, isAuthenticated, isAdmin, isVendor } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Demo Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ShopSphere SaaS Marketplace • Multi-Vendor Live</span>
        </div>

        {/* 1-Click Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium px-2.5 py-0.5 rounded border border-slate-700 transition"
          >
            <span>Active Role: <strong>{user ? `${user.role.toUpperCase()} (${user.name})` : 'Guest / Visitor'}</strong></span>
            <ChevronDown size={14} />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1 text-slate-400 border-b border-slate-700 font-semibold uppercase">
                1-Click Instant Role Switch
              </div>
              <button
                onClick={() => { demoLogin('customer'); setShowDemoMenu(false); setActiveTab('catalog'); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-700 text-emerald-300 flex items-center justify-between"
              >
                <span>🛍️ Customer (Rohan)</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">Buyer</span>
              </button>
              <button
                onClick={() => { demoLogin('vendor'); setShowDemoMenu(false); setActiveTab('vendor-portal'); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-700 text-indigo-300 flex items-center justify-between"
              >
                <span>🏬 Vendor (TechZone Hub)</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded">Merchant</span>
              </button>
              <button
                onClick={() => { demoLogin('admin'); setShowDemoMenu(false); setActiveTab('admin-portal'); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-700 text-amber-300 flex items-center justify-between"
              >
                <span>👑 Super Admin</span>
                <span className="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded">Owner</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Layers size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Shop<span className="text-indigo-600">Sphere</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
              Multi-Vendor
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products across all stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white pl-10 pr-4 py-2 rounded-xl text-sm border border-transparent focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'catalog'
                ? 'bg-indigo-50 text-indigo-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Marketplace
          </button>

          <button
            onClick={() => {
              if (!isAuthenticated) openAuthModal('vendor');
              else setActiveTab('vendor-portal');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'vendor-portal'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Store size={16} />
            <span>{isVendor ? 'Vendor Portal' : 'Sell on ShopSphere'}</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin-portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'admin-portal'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Admin Desk</span>
            </button>
          )}

          {/* Cart Icon */}
          <button
            onClick={() => setActiveTab('cart')}
            className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Avatar / Logout */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={user.avatar || 'https://ik.imagekit.io/shopspheredemo/default-avatar.png'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-sm"
              />
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}