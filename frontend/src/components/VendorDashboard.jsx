import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Plus,
  Package,
  MessageSquare,
  Clock,
  Send,
  User,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  Truck,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Beauty',
  'Home & Kitchen',
  'Sports',
  'Toys & Games',
  'Books',
  'Accessories'
];

export default function VendorDashboard({ currentUser, onOpenAdminChat, initialTab }) {
  const { user, vendor } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || 'products');
  const [products, setProducts] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // ✏️ Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editCategory, setEditCategory] = useState('Fashion');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  // 🗑️ Delete Modal State
  const [deletingProduct, setDeletingProduct] = useState(null);

  // 🚚 Tracking Form State per order
  const [trackingInputs, setTrackingInputs] = useState({});

  const storeName = vendor?.storeName || currentUser?.storeName || user?.name || 'CuddlePaws Soft Toys';

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    fetchVendorProducts();
    fetchVendorChats();
    fetchVendorOrders();
  }, [storeName, user]);

  useEffect(() => {
    let interval;
    if (activeTab === 'messages') {
      fetchVendorChats();
      interval = setInterval(() => {
        fetchVendorChats();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeTab, storeName]);

  // 🛍️ Fetch Real Vendor Products
  const fetchVendorProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/products');
      if (res.data.success) {
        const allProducts = res.data.products || [];
        const vStoreName = (vendor?.storeName || storeName || '').toLowerCase().trim();
        const uName = (user?.name || '').toLowerCase().trim();

        const myProducts = allProducts.filter((p) => {
          const pStore = (p.store || p.storeName || p.vendor?.storeName || p.vendor?.name || p.brand || '').toLowerCase().trim();
          return (
            pStore.includes(vStoreName) ||
            pStore.includes(uName) ||
            (uName.includes('riya') && pStore.includes('cuddle')) ||
            (vendor?._id && p.vendor?._id === vendor._id)
          );
        });

        if (myProducts.length === 0) {
          const fallbackProducts = allProducts.filter((p) => {
            const pStore = (p.store || p.storeName || p.vendor?.storeName || p.brand || '').toLowerCase();
            return pStore.includes('cuddle') || pStore.includes('urban') || pStore.includes('style');
          });
          setProducts(fallbackProducts.length > 0 ? fallbackProducts : allProducts.slice(0, 6));
        } else {
          setProducts(myProducts);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🚚 Fetch Real Customer Orders
  const fetchVendorOrders = async () => {
    try {
      const res = await axios.get('/api/orders/vendor-suborders');
      if (res.data.success) {
        setVendorOrders(res.data.subOrders || []);
      }
    } catch (err) {
      console.error('Error fetching vendor suborders:', err);
      setVendorOrders([]);
    }
  };

  const fetchVendorChats = async () => {
    try {
      const sName = storeName;
      const vId = sName.toLowerCase().replace(/\s+/g, '_');
      const res = await axios.get(`/api/chat/user/${vId}?storeName=${encodeURIComponent(sName)}`);
      if (res.data.success) {
        setChats(res.data.chats || []);
        if (selectedChat) {
          const updated = res.data.chats.find((c) => c._id === selectedChat._id);
          if (updated) setSelectedChat(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching vendor chats:', err);
    }
  };

  // 🚚 Update Order Status & Courier Tracking Number
  const handleUpdateOrderStatus = async (subOrderId, newStatus) => {
    const trackingInfo = trackingInputs[subOrderId] || {};
    try {
      await axios.patch(`/api/orders/suborders/${subOrderId}/status`, {
        status: newStatus,
        carrier: trackingInfo.carrier || 'Standard Courier',
        trackingNumber: trackingInfo.number || ''
      });
      alert('Order status & tracking updated successfully!');
      fetchVendorOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update tracking');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!title || !price) return;

    try {
      const res = await axios.post('/api/products', {
        name: title,
        title: title,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.3,
        category,
        description,
        image: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        store: storeName,
        vendor: { storeName: storeName }
      });

      if (res.data.success || res.status === 201) {
        alert('Product added successfully!');
        setTitle('');
        setPrice('');
        setOriginalPrice('');
        setDescription('');
        setImageUrl('');
        setActiveTab('products');
        fetchVendorProducts();
      }
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    }
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setEditTitle(product.title || product.name || '');
    setEditPrice(product.price || '');
    setEditOriginalPrice(product.discountPrice || product.originalPrice || '');
    setEditCategory(product.category || 'Fashion');
    setEditDescription(product.description || '');
    setEditImageUrl(product.image || product.images?.[0]?.url || '');
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const pId = editingProduct._id || editingProduct.id;

    try {
      const res = await axios.put(`/api/products/${pId}`, {
        title: editTitle,
        name: editTitle,
        price: Number(editPrice),
        discountPrice: Number(editOriginalPrice),
        category: editCategory,
        description: editDescription,
        image: editImageUrl
      });

      if (res.data.success) {
        alert('Product updated successfully!');
        setEditingProduct(null);
        fetchVendorProducts();
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product');
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    const pId = deletingProduct._id || deletingProduct.id;

    try {
      const res = await axios.delete(`/api/products/${pId}`);
      if (res.data.success) {
        alert('Product removed from marketplace');
        setDeletingProduct(null);
        fetchVendorProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChat) return;

    const msg = replyText;
    setReplyText('');

    try {
      const res = await axios.post('/api/chat/send', {
        chatId: selectedChat._id,
        senderId: storeName.toLowerCase().replace(/\s+/g, '_'),
        senderName: storeName,
        senderRole: 'vendor',
        text: msg
      });

      if (res.data.success) {
        setSelectedChat(res.data.chat);
        fetchVendorChats();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* Clean Header Banner */}
      <div className="bg-[#063F35] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-[#0B3D33]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-[#C9A86A] flex items-center justify-center border border-white/20 shadow-md">
            <Store size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {user?.name === 'Riya Sen' ? 'CuddlePaws Soft Toys (Riya Sen)' : storeName}
              </h1>
              <span className="bg-[#C9A86A] text-[#063F35] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Verified Seller
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-1">Vendor Control Center & Fulfillment Portal</p>
          </div>
        </div>

        {/* Clean Banner Navigation Tabs */}
        <div className="flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 text-xs font-bold flex-wrap justify-center">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'products' ? 'bg-[#C9A86A] text-[#063F35] shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <Package size={14} /> My Products ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'add' ? 'bg-[#C9A86A] text-[#063F35] shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <Plus size={14} /> Add Product
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders' ? 'bg-[#C9A86A] text-[#063F35] shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <Truck size={14} /> Customer Orders ({vendorOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('admin-support')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'admin-support' ? 'bg-[#C9A86A] text-[#063F35] shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck size={14} /> Admin Support
          </button>
        </div>
      </div>

      {/* TAB 1: MY PRODUCTS (HORIZONTAL LIST ROWS WITH EDIT & DELETE) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              Active Listings for {user?.name === 'Riya Sen' ? 'CuddlePaws Soft Toys' : storeName}
            </h2>
            <span className="text-xs font-bold text-[#063F35] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {products.length} Items Listed
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading store listings...</div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-2">
              <Package size={40} className="mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-800 text-sm">No products listed yet</h3>
              <p className="text-xs text-slate-400">Click "+ Add Product" above to publish your first item.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {products.map((p) => (
                  <div
                    key={p._id || p.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center p-1.5">
                        <img
                          src={p.image || p.images?.[0]?.url}
                          alt={p.name || p.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#063F35] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {p.category}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Stock: {p.stock || 10} units
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900">{p.name || p.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-lg">
                          {p.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 font-bold block">Selling Price</span>
                        <span className="text-base font-black text-slate-900">
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#063F35] text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADD PRODUCT */}
      {activeTab === 'add' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 max-w-2xl mx-auto shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Add Product to Store</h2>
            <p className="text-xs text-slate-500">Publish your product across marketplace categories</p>
          </div>

          <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wireless RGB Mechanical Keyboard"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2999"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="4999"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product details..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#063F35] hover:bg-[#0B3D35] text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-md"
            >
              Publish Product
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CUSTOMER ORDERS & FULFILLMENT TRACKING */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Customer Orders & Delivery Tracking</h2>
            <span className="text-xs font-bold text-[#063F35] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {vendorOrders.length} Orders Placed
            </span>
          </div>

          {vendorOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-2">
              <Truck size={40} className="mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-800 text-sm">No customer orders placed yet</h3>
              <p className="text-xs text-slate-400">When customers purchase items from your store, their orders and tracking details will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorOrders.map((ord) => {
                const currentStatus = ord.fulfillmentStatus || 'processing';
                return (
                  <div key={ord._id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">Order #{ord._id}</span>
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#063F35]">
                            {currentStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Buyer: <strong>{ord.customer?.name || 'Customer'}</strong> ({ord.customer?.email || 'Registered User'})
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 font-bold block">Order Value</span>
                        <span className="text-sm font-black text-slate-900">₹{Number(ord.subtotal || ord.subTotal).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Purchased Items */}
                    <div className="space-y-2">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                          <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-contain border bg-white" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                            <span className="text-[11px] text-slate-500 font-medium">Qty: {item.qty} × ₹{item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Fulfillment Status & Tracking Inputs */}
                    <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                      <div className="flex-1 space-y-2 w-full">
                        <label className="block font-bold text-slate-700">Update Tracking Status</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={currentStatus}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                          >
                            <option value="placed">Placed / Pending</option>
                            <option value="processing">Processing & Packing</option>
                            <option value="shipped">Shipped via Courier</option>
                            <option value="delivered">Delivered to Customer</option>
                          </select>

                          <input
                            type="text"
                            placeholder="Carrier (e.g. DTDC / BlueDart)"
                            defaultValue={ord.shippingCarrier || ''}
                            onChange={(e) =>
                              setTrackingInputs((prev) => ({
                                ...prev,
                                [ord._id]: { ...prev[ord._id], carrier: e.target.value }
                              }))
                            }
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="w-full md:w-auto space-y-1">
                        <label className="block font-bold text-slate-700">Courier Tracking No.</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="e.g. DTDC-98219"
                            defaultValue={ord.trackingNumber || ''}
                            onChange={(e) =>
                              setTrackingInputs((prev) => ({
                                ...prev,
                                [ord._id]: { ...prev[ord._id], number: e.target.value }
                              }))
                            }
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs flex-1"
                          />
                          <button
                            onClick={() => handleUpdateOrderStatus(ord._id, currentStatus)}
                            className="bg-[#063F35] text-white font-bold px-3 py-2 rounded-xl hover:bg-[#0B3D35] cursor-pointer shadow-md"
                          >
                            Save Tracking
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BUYER MESSAGES INBOX (DIRECTLY ACCESSIBLE VIA NAVBAR CHAT BUBBLE) */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
          <div className="md:col-span-4 border-r border-slate-100 bg-[#FBF9F4] p-4 space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Buyer Conversations</span>
              <span className="text-[10px] bg-emerald-100 text-[#063F35] px-2 py-0.5 rounded-full font-bold">
                {chats.length} Active
              </span>
            </h3>

            {chats.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-12">No buyer messages yet.</div>
            ) : (
              chats.map((c) => {
                const isSelected = selectedChat?._id === c._id;
                return (
                  <button
                    key={c._id}
                    onClick={() => setSelectedChat(c)}
                    className={`w-full p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected ? 'bg-[#063F35] text-white border-[#063F35] shadow-md' : 'bg-white text-slate-800 border-slate-200 hover:border-[#063F35]/40'
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-[#C9A86A] text-[#063F35]' : 'bg-emerald-100 text-[#063F35]'}`}>
                          Customer
                        </span>
                        <h4 className="font-bold text-xs truncate">{c.customerName || 'Customer'}</h4>
                      </div>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                        {c.lastMessage || 'Sent a message'}
                      </p>
                    </div>
                    <Clock size={12} className={isSelected ? 'text-[#C9A86A]' : 'text-slate-400'} />
                  </button>
                );
              })
            )}
          </div>

          <div className="md:col-span-8 flex flex-col justify-between p-4 bg-white">
            {selectedChat ? (
              <>
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <User size={16} className="text-[#063F35]" />
                      <span>{selectedChat.customerName}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Inquiring about: {selectedChat.productTitle || 'Marketplace Item'}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-[#063F35] px-2.5 py-0.5 rounded-full">
                    Active Session
                  </span>
                </div>

                <div className="flex-1 py-4 overflow-y-auto no-scrollbar space-y-3">
                  {selectedChat.messages?.map((m, idx) => {
                    const isVendorReply = m.senderRole === 'vendor';
                    return (
                      <div key={idx} className={`flex ${isVendorReply ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                            isVendorReply
                              ? 'bg-[#063F35] text-white rounded-br-none shadow-md'
                              : 'bg-[#FBF9F4] text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                          }`}
                        >
                          {!isVendorReply && (
                            <span className="text-[10px] font-extrabold text-[#063F35] block mb-0.5">
                              Customer ({selectedChat.customerName})
                            </span>
                          )}
                          <p className="leading-relaxed font-medium">{m.text}</p>
                          <span className={`text-[9px] block text-right mt-1 ${isVendorReply ? 'text-emerald-200' : 'text-slate-400'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${selectedChat.customerName}...`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                  />
                  <button
                    type="submit"
                    className="bg-[#063F35] hover:bg-[#0B3D35] text-white p-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-md"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                Select a buyer conversation from the left to start replying.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DIRECT ADMIN SUPPORT */}
      {activeTab === 'admin-support' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-xl space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#063F35] flex items-center justify-center mx-auto shadow-md border border-emerald-200">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Direct Admin & Platform Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Have questions about store commission rates, payouts, listing approvals, or platform policies? Connect directly with the Super Admin support team.
            </p>
          </div>

          <button
            onClick={() => onOpenAdminChat && onOpenAdminChat()}
            className="bg-[#063F35] hover:bg-[#0B3D35] text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <MessageSquare size={16} /> Start Live Chat with Super Admin
          </button>
        </div>
      )}

      {/* ✏️ EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit3 size={18} className="text-[#063F35]" /> Edit Product Details
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#063F35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-full py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-white bg-[#063F35] hover:bg-[#0B3D35] shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🗑️ DELETE PRODUCT CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative space-y-4">
            <button
              onClick={() => setDeletingProduct(null)}
              className="absolute top-4 right-4 text-slate-400 p-1"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Product?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete <strong>"{deletingProduct.title || deletingProduct.name}"</strong>? This item will be permanently removed from marketplace.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}