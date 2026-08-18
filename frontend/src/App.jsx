import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import VendorDashboard from './components/VendorDashboard';
import CustomerOrders from './components/CustomerOrders';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import {
  ShoppingBag,
  CheckCircle,
  Store,
  ShieldCheck,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  X
} from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isVendor, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'vendor-portal' | 'admin-portal' | 'cart' | 'orders'
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', role: 'customer' });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [removeItemConfirm, setRemoveItemConfirm] = useState({ isOpen: false, item: null });
  const [clearCartConfirm, setClearCartConfirm] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const pId = product._id || product.id;
      const existing = prevCart.find((item) => (item._id || item.id) === pId);
      if (existing) {
        return prevCart.map((item) =>
          (item._id || item.id) === pId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
    showToast(`Added "${product.title}" to cart!`);
  };

  const handleIncreaseQty = (item) => {
    const pId = item._id || item.id;
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        (cartItem._id || cartItem.id) === pId
          ? { ...cartItem, qty: (cartItem.qty || 1) + 1 }
          : cartItem
      )
    );
  };

  const handleDecreaseQty = (item) => {
    const currentQty = item.qty || 1;
    if (currentQty <= 1) {
      setRemoveItemConfirm({ isOpen: true, item });
    } else {
      const pId = item._id || item.id;
      setCart((prevCart) =>
        prevCart.map((cartItem) =>
          (cartItem._id || cartItem.id) === pId
            ? { ...cartItem, qty: currentQty - 1 }
            : cartItem
        )
      );
    }
  };

  const confirmRemoveItem = () => {
    if (removeItemConfirm.item) {
      const pId = removeItemConfirm.item._id || removeItemConfirm.item.id;
      setCart((prevCart) => prevCart.filter((item) => (item._id || item.id) !== pId));
      showToast(`Removed "${removeItemConfirm.item.title}" from cart`);
    }
    setRemoveItemConfirm({ isOpen: false, item: null });
  };

  const confirmClearCart = () => {
    setCart([]);
    setClearCartConfirm(false);
    showToast('Shopping cart cleared');
  };

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      setAuthModal({ isOpen: true, mode: 'login', role: 'customer' });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order) => {
    setCart([]);
    showToast('🎉 Payment Verified! Multi-vendor order placed!');
    setTimeout(() => {
      setIsCheckoutOpen(false);
      setActiveTab('orders');
    }, 1500);
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

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.reduce((sum, item) => sum + (item.qty || 1), 0)}
        openAuthModal={openAuthModal}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'catalog' && (
          <ProductGrid
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
            onOpenChat={(p) => showToast(`💬 Live Chat with "${p.vendor?.storeName || 'Seller'}" activates in Day 3!`)}
            onSelectProduct={(p) => showToast(`Selected: ${p.title}`)}
          />
        )}

        {activeTab === 'orders' && <CustomerOrders />}

        {activeTab === 'vendor-portal' && (
          isVendor ? (
            <VendorDashboard />
          ) : (
            <div className="max-w-md mx-auto my-12 px-4">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
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
            </div>
          )
        )}

        {activeTab === 'admin-portal' && (
          <div className="max-w-4xl mx-auto my-8 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Super Admin Command Center</h1>
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
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag size={22} className="text-indigo-600" />
                <span>Multi-Vendor Cart ({cart.reduce((s, i) => s + (i.qty || 1), 0)} items)</span>
              </h1>
              {cart.length > 0 && (
                <button
                  onClick={() => setClearCartConfirm(true)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 px-3 py-1.5 hover:bg-rose-50 rounded-xl transition border border-rose-100"
                >
                  <Trash2 size={13} /> <span>Clear Cart</span>
                </button>
              )}
            </div>

            {cart.length > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <div className="divide-y divide-slate-100">
                  {cart.map((item) => {
                    const itemTotal = (item.discountPrice || item.price) * (item.qty || 1);
                    return (
                      <div key={item._id || item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <img
                            src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                            alt={item.title}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">{item.title}</h4>
                            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
                              <Store size={12} /> Sold by: {item.vendor?.storeName || 'Verified Merchant'}
                            </span>
                            <span className="text-xs font-bold text-slate-900 block mt-1">
                              ₹{(item.discountPrice || item.price).toLocaleString('en-IN')} each
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pl-20 sm:pl-0">
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                            <button
                              type="button"
                              onClick={() => handleDecreaseQty(item)}
                              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-rose-600 transition shadow-sm"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-extrabold px-3 text-slate-800 min-w-[24px] text-center">
                              {item.qty || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncreaseQty(item)}
                              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-indigo-600 transition shadow-sm"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="text-right min-w-[75px]">
                            <span className="font-black text-sm text-slate-900">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setRemoveItemConfirm({ isOpen: true, item })}
                            title="Remove from Cart"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Subtotal ({cart.reduce((s, i) => s + (i.qty || 1), 0)} items)</span>
                    <h3 className="text-2xl font-black text-slate-900">
                      ₹{cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * (item.qty || 1), 0).toLocaleString('en-IN')}
                    </h3>
                  </div>
                  <button
                    onClick={handleOpenCheckout}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md shadow-indigo-200 transition"
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
                <p className="text-xs text-slate-400 mt-1 mb-4">Add products from multiple vendors across the marketplace.</p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bg-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm"
                >
                  Explore Marketplace
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 💳 Stripe Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        user={user}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Confirmation Modals */}
      {removeItemConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
            <button onClick={() => setRemoveItemConfirm({ isOpen: false, item: null })} className="absolute top-4 right-4 text-slate-400">
              <X size={18} />
            </button>
            <div className="w-13 h-13 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5 p-3">
              <AlertTriangle size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Remove from Cart?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to remove <strong>"{removeItemConfirm.item?.title}"</strong>?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setRemoveItemConfirm({ isOpen: false, item: null })} className="py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100">
                Keep Item
              </button>
              <button onClick={confirmRemoveItem} className="py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 shadow-md">
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {clearCartConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
            <button onClick={() => setClearCartConfirm(false)} className="absolute top-4 right-4 text-slate-400">
              <X size={18} />
            </button>
            <div className="w-13 h-13 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5 p-3">
              <Trash2 size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Clear Cart?</h3>
            <p className="text-xs text-slate-500 mb-5">Are you sure you want to remove all items from your cart?</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setClearCartConfirm(false)} className="py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100">
                Cancel
              </button>
              <button onClick={confirmClearCart} className="py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 shadow-md">
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

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