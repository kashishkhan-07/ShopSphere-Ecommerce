import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import VendorDashboard from './components/VendorDashboard';
import AuthModal from './components/AuthModal';
import { ShoppingBag, CheckCircle, Store, ShieldCheck, ArrowRight } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isVendor, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'vendor-portal' | 'admin-portal' | 'cart'
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', role: 'customer' });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      if (existing) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
    showToast(`Added "${product.title}" to cart!`);
  };

  const handleOpenChat = (product) => {
    showToast(`💬 Live Chat with "${product.vendor?.storeName || 'Seller'}" activates in Day 3 Sprint!`);
  };

  const handleSelectProduct = (product) => {
    showToast(`Viewing details for: ${product.title}`);
  };

  const openAuthModal = (mode = 'login', role = 'customer') => {
    setAuthModal({ isOpen: true, mode, role });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
        openAuthModal={openAuthModal}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'catalog' && (
          <ProductGrid
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
            onOpenChat={handleOpenChat}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activeTab === 'vendor-portal' && (
          isVendor ? (
            <VendorDashboard />
          ) : (
            <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
              <Store size={48} className="mx-auto text-indigo-600 mb-3" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">Merchant Registration</h2>
              <p className="text-xs text-slate-500 mb-6">
                You are currently browsing as {user ? user.role : 'Guest'}. Switch to a Vendor account or sign up to access your merchant portal.
              </p>
              <button
                onClick={() => openAuthModal('register', 'vendor')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition"
              >
                Register as Merchant
              </button>
            </div>
          )
        )}

        {activeTab === 'admin-portal' && (
          <div className="max-w-4xl mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Super Admin Command Center</h1>
                <p className="text-xs text-slate-500">Platform-wide overview, SaaS metrics & vendor KYC approvals.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">Gross Merchandise Value</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">₹1,50,000</h3>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">Platform Commissions</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">₹11,400</h3>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase">Active Subscribed Vendors</span>
                <h3 className="text-2xl font-black text-indigo-600 mt-1">2 Merchants</h3>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
              ⚡ <strong>Day 2 Sprint:</strong> Multi-Vendor Stripe checkout, Order-splitting engine, and SaaS Stripe Billing will connect to this admin view!
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ShoppingBag size={24} className="text-indigo-600" />
              <span>Multi-Vendor Shopping Cart ({cart.length} items)</span>
            </h1>

            {cart.length > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div key={item._id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.images?.[0]?.url}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                            <Store size={12} /> Sold by: {item.vendor?.storeName || 'Verified Merchant'}
                          </span>
                          <span className="text-xs font-bold text-slate-900 block mt-1">
                            ₹{(item.discountPrice || item.price).toLocaleString('en-IN')} × {item.qty}
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-base text-slate-900">
                        ₹{((item.discountPrice || item.price) * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Subtotal</span>
                    <h3 className="text-2xl font-black text-slate-900">
                      ₹{cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.qty, 0).toLocaleString('en-IN')}
                    </h3>
                  </div>
                  <button
                    onClick={() => showToast('💳 Stripe Checkout & Order-Splitting will execute in Day 2 Sprint!')}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-indigo-200"
                  >
                    <span>Proceed to Stripe Checkout</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <ShoppingBag size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Your cart is empty</h3>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="mt-4 bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl"
                >
                  Explore Marketplace
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialMode={authModal.mode}
        initialRole={authModal.role}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}