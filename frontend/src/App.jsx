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
import WishlistPage from './components/WishlistPage';
import { ShoppingBag, Trash2, CheckCircle, AlertTriangle, X, CreditCard, Plus, Minus } from 'lucide-react';
import axios from 'axios';

function MainApp() {
  const { user, isAuthenticated, isVendor, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('shopsphere_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.role === 'vendor') return 'vendor-portal';
        if (u.role === 'admin') return 'admin-portal';
      } catch (e) {}
    }
    return 'catalog';
  });

  useEffect(() => {
    if (isVendor && activeTab === 'catalog') {
      setActiveTab('vendor-portal');
    }
    if (isAdmin && activeTab === 'catalog') {
      setActiveTab('admin-portal');
    }
  }, [isVendor, isAdmin]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shopsphere_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('shopsphere_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [chatDrawer, setChatDrawer] = useState({ isOpen: false, product: null });
  const [toastMessage, setToastMessage] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null, productTitle: '' });
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('shopsphere_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('shopsphere_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // 🔴 Real-Time Unread Messages Counter for Navbar (Customer & Vendor)
  useEffect(() => {
    if (!user) return;
    const checkUnread = async () => {
      try {
        const uId = user.id || user._id || user.email;
        const sName = user.storeName || user.name;
        const res = await axios.get(`/api/chat/user/${uId}?storeName=${encodeURIComponent(sName)}`);
        if (res.data.success && res.data.chats) {
          let count = 0;
          res.data.chats.forEach((c) => {
            const last = c.messages?.[c.messages.length - 1];
            if (last) {
              const sentByMe = isVendor ? last.senderRole === 'vendor' : last.senderRole === 'buyer';
              if (!sentByMe) count += 1;
            }
          });
          setUnreadChatCount(count);
        }
      } catch (e) {}
    };

    checkUnread();
    const interval = setInterval(checkUnread, 2500);
    return () => clearInterval(interval);
  }, [user, isVendor]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddToCart = (product) => {
    if (!product) return;
    const targetId = product._id || product.id;

    setCart((prev) => {
      const existing = prev.find((item) => (item.product._id || item.product.id) === targetId);
      if (existing) {
        return prev.map((item) =>
          (item.product._id || item.product.id) === targetId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast(`Added "${product.title}" to Cart! 🛒`);
  };

  const handleToggleWishlist = (product) => {
    if (!product) return;
    const targetId = product._id || product.id;

    setWishlist((prev) => {
      const exists = prev.some((p) => (p._id || p.id) === targetId);
      if (exists) {
        showToast(`Removed "${product.title}" from Wishlist`);
        return prev.filter((p) => (p._id || p.id) !== targetId);
      }
      showToast(`Saved "${product.title}" to Wishlist ❤️`);
      return [...prev, product];
    });
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    showToast('Item removed from wishlist');
  };

  const handleIncrement = (productId) => {
    setCart((prev) =>
      prev.map((item) =>
        (item.product._id || item.product.id) === productId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleDecrement = (item) => {
    const pId = item.product._id || item.product.id;
    if (item.qty > 1) {
      setCart((prev) =>
        prev.map((i) =>
          (i.product._id || i.product.id) === pId ? { ...i, qty: i.qty - 1 } : i
        )
      );
    } else {
      setDeleteConfirm({
        isOpen: true,
        productId: pId,
        productTitle: item.product.title,
      });
    }
  };

  const confirmDeleteItem = () => {
    if (deleteConfirm.productId) {
      setCart((prev) => prev.filter((i) => (i.product._id || i.product.id) !== deleteConfirm.productId));
      showToast('Item removed from cart');
    }
    setDeleteConfirm({ isOpen: false, productId: null, productTitle: '' });
  };

  const confirmClearCart = () => {
    setCart([]);
    setShowClearCartConfirm(false);
    showToast('Cart emptied');
  };

  const [vendorSubTab, setVendorSubTab] = useState('products');
  const [adminSubTab, setAdminSubTab] = useState('governance');

  const handleNavbarChatClick = () => {
    if (isAdmin) {
      setAdminSubTab('vendor-chats');
      setActiveTab('admin-portal');
    } else if (isVendor) {
      setVendorSubTab('messages');
      setActiveTab('vendor-portal');
    } else {
      setChatDrawer({ isOpen: true, product: null });
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalAmount = cart.reduce((sum, item) => {
    const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
    return sum + price * item.qty;
  }, 0);

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#063F35] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-[#C9A86A]">
          <CheckCircle size={16} className="text-[#C9A86A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        unreadChatCount={unreadChatCount}
        onOpenChatDrawer={handleNavbarChatClick}
        openAuthModal={(mode) => { setAuthMode(mode); setIsAuthOpen(true); }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'catalog' && (
          <ProductGrid
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistItems={wishlist}
            onOpenChat={(p) => setChatDrawer({ isOpen: true, product: p })}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistPage
            wishlistItems={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onContinueShopping={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'orders' && <CustomerOrders />}

        {activeTab === 'vendor-portal' && (
          <VendorDashboard onOpenAdminChat={() => setChatDrawer({ isOpen: true, product: null })} currentUser={user} initialTab={vendorSubTab} />
        )}

        {activeTab === 'admin-portal' && (
          <AdminPortal
            onOpenVendorChat={() => {
              setAdminSubTab('vendor-chats');
              setActiveTab('admin-portal');
            }}
            initialTab={adminSubTab}
          />
        )}

        {/* Shopping Cart Page */}
        {activeTab === 'cart' && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag size={24} className="text-[#063F35]" />
                <span>Your Shopping Cart ({totalCartCount} items)</span>
              </h1>

              {cart.length > 0 && (
                <button
                  onClick={() => setShowClearCartConfirm(true)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer"
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
                    const pId = item.product._id || item.product.id;
                    return (
                      <div
                        key={pId}
                        className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-4 shadow-2xs"
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
                            <span className="text-[11px] text-[#063F35] font-semibold block">
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
                              className="p-1 text-slate-600 hover:text-[#063F35] hover:bg-white rounded-lg transition cursor-pointer"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-slate-800">{item.qty}</span>
                            <button
                              onClick={() => handleIncrement(pId)}
                              className="p-1 text-slate-600 hover:text-[#063F35] hover:bg-white rounded-lg transition cursor-pointer"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                isOpen: true,
                                productId: pId,
                                productTitle: item.product.title,
                              })
                            }
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm h-fit space-y-4">
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
                      <span className="text-[#063F35]">₹{cartTotalAmount.toLocaleString('en-IN')}</span>
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
                    className="w-full bg-[#063F35] hover:bg-[#0B3D35] text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-[#063F35]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard size={16} />
                    <span>Proceed to Stripe Checkout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
                <ShoppingBag size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-800">Your shopping cart is empty</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">Explore our multi-vendor marketplace and discover great products.</p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bg-[#063F35] hover:bg-[#0B3D35] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition cursor-pointer"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating AI Assistant */}
      <AiChatbot />

      {/* Live Chat Drawer */}
      <ChatDrawer
        isOpen={chatDrawer.isOpen}
        onClose={() => setChatDrawer({ isOpen: false, product: null })}
        targetProduct={chatDrawer.product}
        currentUser={user}
      />

      {/* Stripe Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cart}
          onOrderSuccess={() => {
            setCart([]);
            setActiveTab('orders');
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* Deletion Modals */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
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
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteItem}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearCartConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative">
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
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearCart}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 cursor-pointer"
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