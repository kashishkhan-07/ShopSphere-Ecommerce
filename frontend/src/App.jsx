import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import CheckoutModal from './components/CheckoutModal';
import CustomerOrders from './components/CustomerOrders';
import VendorDashboard from './components/VendorDashboard';
import AdminPortal from './components/AdminPortal';
import ChatDrawer from './components/ChatDrawer';
import AiChatbot from './components/AiChatbot';
import AuthModal from './components/AuthModal';
import {
  ShoppingBag,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  CreditCard,
  Plus,
  Minus
} from 'lucide-react';

function MainApp() {
  const { user, isAuthenticated, isVendor, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shopsphere_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [chatDrawer, setChatDrawer] = useState({ isOpen: false, product: null });

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null, productTitle: '' });
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('shopsphere_cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast(`Added "${product.title}" to cart!`);
  };

  const handleIncrement = (productId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleDecrement = (item) => {
    if (item.qty > 1) {
      setCart((prev) =>
        prev.map((i) =>
          i.product._id === item.product._id ? { ...i, qty: i.qty - 1 } : i
        )
      );
    } else {
      setDeleteConfirm({
        isOpen: true,
        productId: item.product._id,
        productTitle: item.product.title,
      });
    }
  };

  const confirmDeleteItem = () => {
    if (deleteConfirm.productId) {
      setCart((prev) => prev.filter((i) => i.product._id !== deleteConfirm.productId));
      showToast('Item removed from cart');
    }
    setDeleteConfirm({ isOpen: false, productId: null, productTitle: '' });
  };

  const confirmClearCart = () => {
    setCart([]);
    setShowClearCartConfirm(false);
    showToast('Cart emptied');
  };

  const handleOpenChat = (product) => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    setChatDrawer({ isOpen: true, product });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalAmount = cart.reduce((sum, item) => {
    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    return sum + price * item.qty;
  }, 0);

  return (
  <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
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
        cartCount={totalCartCount}
        onOpenChatDrawer={() => setChatDrawer({ isOpen: true, product: null })}
        openAuthModal={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'catalog' && (
          <ProductGrid
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
            onOpenChat={handleOpenChat}
            onSelectProduct={(p) => handleOpenChat(p)}
          />
        )}

        {activeTab === 'orders' && (
          <CustomerOrders />
        )}

        {activeTab === 'vendor-portal' && (
          <VendorDashboard
            onOpenAdminChat={(convo) => {
              setChatDrawer({ isOpen: true, product: null });
            }}
          />
        )}

        {activeTab === 'admin-portal' && (
          <AdminPortal
            onOpenVendorChat={(convo) => {
              setChatDrawer({ isOpen: true, product: null });
            }}
          />
        )}

        {/* 🛒 Cart View */}
        {activeTab === 'cart' && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag size={24} className="text-indigo-600" />
                <span>Your Shopping Cart ({totalCartCount} items)</span>
              </h1>

              {cart.length > 0 && (
                <button
                  onClick={() => setShowClearCartConfirm(true)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition"
                >
                  <Trash2 size={14} /> Clear Cart
                </button>
              )}
            </div>

            {cart.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-3">
                  {cart.map((item) => {
                    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
                    const itemImg = item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';
                    return (
                      <div
                        key={item.product._id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={itemImg}
                            alt={item.product.title}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';
                            }}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                              {item.product.title}
                            </h4>
                            <span className="text-[11px] text-indigo-600 font-semibold block">
                              Store: {item.product.vendor?.storeName || 'Verified Merchant'}
                            </span>
                            <span className="text-xs font-black text-slate-900 block mt-1">
                              ₹{price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                            <button
                              onClick={() => handleDecrement(item)}
                              className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-slate-800">{item.qty}</span>
                            <button
                              onClick={() => handleIncrement(item.product._id)}
                              className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                productId: item.product._id,
                                productTitle: item.product.title,
                              })
                            }
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                    Order Summary
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Items Subtotal</span>
                      <span>₹{cartTotalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping / Courier</span>
                      <span className="text-emerald-600 font-bold">FREE</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-sm text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-indigo-600">₹{cartTotalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        setAuthMode('login');
                        setIsAuthOpen(true);
                        return;
                      }
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} />
                    <span>Proceed to Stripe Checkout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <ShoppingBag size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-800">Your shopping cart is empty</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">Explore our multi-vendor marketplace and discover great products.</p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 💬 Live Messenger Drawer */}
      <ChatDrawer
        isOpen={chatDrawer.isOpen}
        onClose={() => setChatDrawer({ isOpen: false, product: null })}
        targetProduct={chatDrawer.product}
      />

      {/* 🤖 24/7 AI Smart Assistant */}
      <AiChatbot />

      {/* 💳 Stripe Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cart}
          onOrderSuccess={() => {
            setCart([]);
            setActiveTab('orders');
            showToast('Order Placed Successfully via Stripe!');
          }}
        />
      )}

      {/* 🔑 Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* 🗑️ Deletion Confirmation Modals */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative font-['Plus_Jakarta_Sans',sans-serif]">
            <button
              onClick={() => setDeleteConfirm({ isOpen: false, productId: null, productTitle: '' })}
              className="absolute top-4 right-4 text-slate-400 p-1"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Remove Cart Item?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to remove <strong>"{deleteConfirm.productTitle}"</strong> from your cart?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, productId: null, productTitle: '' })}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteItem}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearCartConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative font-['Plus_Jakarta_Sans',sans-serif]">
            <button
              onClick={() => setShowClearCartConfirm(false)}
              className="absolute top-4 right-4 text-slate-400 p-1"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Clear Shopping Cart?</h3>
            <p className="text-xs text-slate-500 mb-5">
              This will remove all items from your current cart.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowClearCartConfirm(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCart}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}