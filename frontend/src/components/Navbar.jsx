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
  Headphones,
  Home
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
  wishlistCount = 0,
  unreadChatCount = 0
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
        <div className="bg-[#0B3D35] text-white text-[10px] sm:text-[11px] px-3 sm:px-4 py-1 flex items-center justify-between font-medium">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="flex items-center gap-1 opacity-90"><Truck size={12} className="text-[#C9A86A]" /> Free Shipping &gt; ₹499</span>
            <span className="hidden sm:flex items-center gap-1 opacity-90"><ShieldCheck size={12} className="text-[#C9A86A]" /> 100% Secure Payments</span>
            <span className="hidden md:flex items-center gap-1 opacity-90"><RotateCcw size={12} className="text-[#C9A86A]" /> Easy Returns</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-200">
            <button onClick={() => handleRoleSwitch('vendor')} className="text-[#C9A86A] font-bold hover:underline cursor-pointer flex items-center gap-1">
              <Store size={11} /> Sell on ShopSphere
            </button>
          </div>
        </div>

        {/* Primary Header */}
        <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <button onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-left group cursor-pointer shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#063F35] text-[#C9A86A] flex items-center justify-center shadow-md shadow-[#063F35]/20 group-hover:scale-105 transition">
              <ShoppingBag size={18} />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 flex items-center">
                ShopSphere<span className="text-[#C9A86A]">.</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-extrabold tracking-wider text-slate-400 block -mt-1 uppercase">
                Marketplace
              </span>
            </div>
          </button>

          {/* Desktop Search Bar */}
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

            <button className="bg-[#063F35] text-white p-2.5 px-4 transition cursor-pointer flex items-center justify-center">
              <Search size={16} />
            </button>
          </div>

          {/* Right Desktop Links + ALWAYS VISIBLE PROFILE */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!isVendor && !isAdmin && (
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`hidden md:flex items-center gap-1.5 text-xs font-bold p-2 px-3 rounded-xl transition cursor-pointer ${
                  activeTab === 'wishlist' ? 'bg-[#063F35] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Heart size={18} className={wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'} />
                <span>Wishlist</span>
                {wishlistCount > 0 && <span className="bg-[#C9A86A] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">{wishlistCount}</span>}
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={onOpenChatDrawer}
                className="hidden md:flex items-center gap-1 text-slate-700 hover:text-[#063F35] text-xs font-bold p-2 px-3 rounded-xl hover:bg-slate-100 transition cursor-pointer relative"
              >
                <MessageCircle size={18} className="text-[#063F35]" />
                <span>Chat</span>
                {unreadChatCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            )}

            {!isVendor && !isAdmin && (
              <button
                onClick={() => setActiveTab('cart')}
                className={`hidden md:flex items-center gap-1.5 text-xs font-bold p-2 px-3 rounded-xl transition cursor-pointer relative ${
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

            {/* 👤 ALWAYS VISIBLE PROFILE BUTTON & DROPDOWN (DESKTOP & MOBILE HEADER) */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1 px-2 sm:px-3 rounded-2xl transition cursor-pointer"
                >
                  <img src={user.avatar || getAvatar(user.name)} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-[#063F35]" />
                  <span className="text-xs font-bold text-slate-900 max-w-[80px] sm:max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
              <button onClick={() => openAuthModal('login')} className="bg-[#063F35] text-white text-xs font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md cursor-pointer">Sign In</button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 hover:text-[#063F35] md:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="px-4 pb-2.5 md:hidden">
          <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 px-3 py-1.5">
            <Search size={14} className="text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search products, brands & stores..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'catalog') setActiveTab('catalog');
              }}
              className="w-full text-xs bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Sticky Sub-Header Categories */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-4 py-2 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap">
            <button onClick={() => setSelectedCategory('All')} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer ${selectedCategory === 'All' ? 'bg-[#063F35] text-white' : 'bg-slate-900 text-white'}`}>
              <Layers size={13} /> <span>All</span>
            </button>
            {CATEGORIES_NAV.map((cat) => (
              <button key={cat.name} onClick={() => { setSelectedCategory(cat.name); if (activeTab !== 'catalog') setActiveTab('catalog'); }} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl cursor-pointer ${selectedCategory === cat.name ? 'bg-[#063F35] text-white' : 'hover:bg-slate-200/70 text-slate-700'}`}>
                <span>{cat.icon}</span> <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Slide-Out Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden flex justify-end">
          <div className="bg-white w-4/5 max-w-xs h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#063F35] text-[#C9A86A] flex items-center justify-center font-bold">
                    <ShoppingBag size={16} />
                  </div>
                  <span className="font-black text-sm text-slate-900">ShopSphere Menu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-1">
                  <X size={20} />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="bg-slate-50 p-3 rounded-2xl space-y-1">
                  <p className="text-xs font-black text-slate-900">{user.name}</p>
                  <span className="text-[10px] font-bold text-[#063F35] uppercase bg-emerald-50 px-2 py-0.5 rounded-md inline-block">{user.role}</span>
                </div>
              ) : null}

              <div className="space-y-1 text-xs font-bold text-slate-700">
                <button onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 flex items-center gap-2">
                  <Home size={16} className="text-[#063F35]" /> Marketplace Catalog
                </button>

                {!isVendor && !isAdmin && (
                  <>
                    <button onClick={() => { setActiveTab('wishlist'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 flex items-center gap-2">
                      <Heart size={16} className="text-rose-500" /> Saved Wishlist ({wishlistCount})
                    </button>
                    <button onClick={() => { setActiveTab('cart'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 flex items-center gap-2">
                      <ShoppingBag size={16} className="text-[#063F35]" /> Shopping Cart ({cartCount})
                    </button>
                    <button onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 flex items-center gap-2">
                      <Package size={16} className="text-indigo-600" /> My Orders & Tracking
                    </button>
                  </>
                )}

                {isVendor && (
                  <button onClick={() => { setActiveTab('vendor-portal'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-xl bg-emerald-50 text-[#063F35] flex items-center gap-2">
                    <Store size={16} /> Vendor Merchant Portal
                  </button>
                )}

                {isAdmin && (
                  <button onClick={() => { setActiveTab('admin-portal'); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-xl bg-amber-50 text-amber-900 flex items-center gap-2">
                    <ShieldCheck size={16} /> Admin Command Center
                  </button>
                )}

                {isAuthenticated && (
                  <button onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 flex items-center gap-2">
                    <User size={16} /> Edit Profile & Address
                  </button>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full py-3 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Dock Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200/80 md:hidden flex items-center justify-around py-2 px-3 shadow-lg font-['Plus_Jakarta_Sans',sans-serif]">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${
            activeTab === 'catalog' ? 'text-[#063F35]' : 'text-slate-500'
          }`}
        >
          <Home size={18} />
          <span>Home</span>
        </button>

        {!isVendor && !isAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer relative ${
                activeTab === 'wishlist' ? 'text-[#063F35]' : 'text-slate-500'
              }`}
            >
              <Heart size={18} className={wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''} />
              <span>Wishlist</span>
            </button>

            <button
              onClick={() => setActiveTab('cart')}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer relative ${
                activeTab === 'cart' ? 'text-[#063F35]' : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#C9A86A] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </button>
          </>
        ) : isVendor ? (
          <button
            onClick={() => setActiveTab('vendor-portal')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${
              activeTab === 'vendor-portal' ? 'text-[#063F35]' : 'text-slate-500'
            }`}
          >
            <Store size={18} />
            <span>Portal</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('admin-portal')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${
              activeTab === 'admin-portal' ? 'text-[#063F35]' : 'text-slate-500'
            }`}
          >
            <ShieldCheck size={18} />
            <span>Admin</span>
          </button>
        )}

        {isAuthenticated ? (
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500 cursor-pointer"
          >
            <User size={18} />
            <span>Profile</span>
          </button>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#063F35] cursor-pointer"
          >
            <User size={18} />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowLogoutConfirm(false)} className="absolute top-4 right-4 text-slate-400 p-1">
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LogOut size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Sign Out from ShopSphere?</h3>
            <p className="text-xs text-slate-500 mb-5">Are you sure you want to end your current session?</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowLogoutConfirm(false)} className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100">Cancel</button>
              <button onClick={() => { setShowLogoutConfirm(false); logout(); setActiveTab('catalog'); }} className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 shadow-md">Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}