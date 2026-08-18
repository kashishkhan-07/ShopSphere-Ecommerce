import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SubscriptionModal from './SubscriptionModal';
import {
  Plus,
  Package,
  DollarSign,
  Store,
  Trash2,
  X,
  Truck,
  CheckCircle,
  Clock,
  Crown
} from 'lucide-react';

export default function VendorDashboard() {
  const { vendor, user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [subOrders, setSubOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [shippingModal, setShippingModal] = useState({ isOpen: false, orderId: null });
  const [shippingData, setShippingData] = useState({ carrier: 'Bluedart Express', trackingNumber: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    brand: '',
    price: '',
    discountPrice: '',
    stock: '',
    imageUrl: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        api.get('/products/vendor/my-products'),
        api.get('/orders/vendor-suborders'),
      ]);
      setProducts(prodRes.data.products || []);
      setSubOrders(orderRes.data.subOrders || []);
    } catch (err) {
      console.error('Error fetching vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        brand: formData.brand || 'Generic',
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice) || 0,
        stock: Number(formData.stock),
        images: [
          { url: formData.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
        ],
      };

      await api.post('/products', payload);
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Electronics',
        brand: '',
        price: '',
        discountPrice: '',
        stock: '',
        imageUrl: '',
      });
      fetchVendorData();
      showToast('Product published to marketplace successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchVendorData();
      showToast('Product removed');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'shipped') {
      setShippingModal({ isOpen: true, orderId });
      return;
    }

    try {
      await api.patch(`/orders/suborders/${orderId}/status`, { status: newStatus });
      fetchVendorData();
      showToast(`Order marked as ${newStatus}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleConfirmShipping = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/orders/suborders/${shippingModal.orderId}/status`, {
        status: 'shipped',
        carrier: shippingData.carrier,
        trackingNumber: shippingData.trackingNumber || `TRK${Math.floor(100000 + Math.random() * 900000)}`,
      });
      setShippingModal({ isOpen: false, orderId: null });
      fetchVendorData();
      showToast('Order marked as Shipped with tracking number!');
    } catch (err) {
      alert('Shipping update failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Profile Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={vendor?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor?.storeName || 'Store')}&background=4f46e5&color=fff&bold=true`}
            alt={vendor?.storeName}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{vendor?.storeName || 'Vendor Merchant Portal'}</h1>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                Fee: {vendor?.commissionRate || 5.0}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-md">{vendor?.description || 'Manage products, incoming sub-orders, and fulfill deliveries.'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md shadow-amber-200 transition"
          >
            <Crown size={15} />
            <span>Upgrade SaaS Tier</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md shadow-indigo-200 transition"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 💰 Live Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Pending Escrow</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            ₹{(vendor?.wallet?.pendingBalance || 0).toLocaleString('en-IN')}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">Held until customer delivery</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Available for Payout</span>
            <DollarSign size={18} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600">
            ₹{(vendor?.wallet?.availableBalance || 0).toLocaleString('en-IN')}
          </h3>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">Ready to withdraw</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Active Products</span>
            <Package size={18} className="text-indigo-500" />
          </div>
          <h3 className="text-2xl font-black text-indigo-600">{products.length} Items</h3>
          <span className="text-[11px] text-slate-400 mt-1 block">Listed on marketplace</span>
        </div>
      </div>

      {/* Sub Tabs Switcher */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeSubTab === 'inventory'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📦 Catalog & Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeSubTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck size={14} />
          <span>Fulfillment & Sub-Orders ({subOrders.length})</span>
        </button>
      </div>

      {/* 📦 Tab 1: Products Inventory */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:px-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">Listed Products</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                        alt={p.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <span className="font-bold text-slate-800">{p.title}</span>
                    </td>
                    <td className="p-4 text-slate-600">{p.category}</td>
                    <td className="p-4 font-bold text-slate-900">₹{(p.discountPrice || p.price).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        p.stock > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🚚 Tab 2: Sub-Orders Fulfillment Manager */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {subOrders.length > 0 ? (
            subOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Sub-Order ID</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">#{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Your Earnings</span>
                    <span className="font-black text-emerald-600 text-sm">₹{order.vendorEarnings.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Fulfillment Status</span>
                    <span className="font-bold text-xs uppercase text-indigo-600">{order.fulfillmentStatus}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.fulfillmentStatus === 'placed' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'processing')}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition"
                      >
                        Start Processing
                      </button>
                    )}

                    {order.fulfillmentStatus === 'processing' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'shipped')}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
                      >
                        <Truck size={14} /> Ship Order
                      </button>
                    )}

                    {order.fulfillmentStatus === 'shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'delivered')}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
                      >
                        <CheckCircle size={14} /> Mark Delivered
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.title} className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                        <span className="font-medium text-slate-700">{item.title} × {item.qty}</span>
                      </div>
                      <span className="font-bold text-slate-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {order.trackingNumber && (
                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                    <Truck size={14} className="text-indigo-600" />
                    <span>Carrier: <strong>{order.shippingCarrier}</strong> | Tracking ID: <strong>{order.trackingNumber}</strong></span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
              <Truck size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No customer orders yet</h3>
              <p className="text-xs text-slate-400 mt-1">Orders placed by customers for your store will appear here for fulfillment.</p>
            </div>
          )}
        </div>
      )}

      {/* 🚢 Shipping Tracking ID Modal */}
      {shippingModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <button onClick={() => setShippingModal({ isOpen: false, orderId: null })} className="absolute top-4 right-4 text-slate-400">
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Truck size={18} className="text-indigo-600" />
              <span>Dispatch & Tracking</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Enter shipping courier and tracking reference number for the customer.</p>

            <form onSubmit={handleConfirmShipping} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Carrier Name</label>
                <input
                  type="text"
                  required
                  value={shippingData.carrier}
                  onChange={(e) => setShippingData({ ...shippingData, carrier: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BLUEDART849204"
                  value={shippingData.trackingNumber}
                  onChange={(e) => setShippingData({ ...shippingData, trackingNumber: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition"
              >
                Confirm Dispatch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ➕ Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400">
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Add Marketplace Product</h2>
            <p className="text-xs text-slate-500 mb-4">List a new item under your vendor store profile.</p>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Headphones"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="3999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Discount Price</label>
                  <input
                    type="number"
                    placeholder="2999"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed product specifications..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition"
              >
                Publish to Marketplace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 👑 SaaS Subscription Upgrade Modal */}
      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentCommission={vendor?.commissionRate}
        onUpgradeSuccess={(data) => {
          fetchVendorData();
          showToast(data.message);
        }}
      />
    </div>
  );
}