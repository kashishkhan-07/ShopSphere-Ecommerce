import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
  Package,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';

export default function VendorDashboard() {
  const { user, vendor } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const fetchVendorProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/vendor/my-products');
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Error fetching vendor products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        brand: formData.brand || 'Store Exclusive',
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        stock: Number(formData.stock),
        images: formData.imageUrl
          ? [{ url: formData.imageUrl }]
          : [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' }],
      };

      const res = await api.post('/products', payload);
      if (res.data.success) {
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
        fetchVendorProducts();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Vendor Store Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={vendor?.logo || 'https://ik.imagekit.io/shopspheredemo/default-store.png'}
              alt={vendor?.storeName}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{vendor?.storeName || "Merchant Store"}</h1>
                {vendor?.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck size={14} /> Verified Store
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {vendor?.description || "Manage your product catalog, orders, and wallet balance."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-3 rounded-2xl shadow-sm shadow-indigo-200 transition"
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Package size={22} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Listed Products</span>
              <h3 className="text-xl font-black text-slate-900">{products.length} Items</h3>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet size={22} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Available Wallet Balance</span>
              <h3 className="text-xl font-black text-emerald-600">
                ₹{(vendor?.wallet?.availableBalance || 0).toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">SaaS Plan & Commission</span>
              <h3 className="text-xl font-black text-slate-900">
                {vendor?.subscriptionPlan?.name || 'Pro Tier'} ({vendor?.commissionRate || 5}% Cut)
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your Inventory & Catalog</h2>
          <span className="text-xs font-semibold text-slate-500">{products.length} Products Active</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading your inventory...</div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url || 'https://ik.imagekit.io/shopspheredemo/default-product.png'}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 line-clamp-1">{p.title}</h4>
                        <span className="text-xs text-slate-400">{p.brand}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-600">{p.category}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Listed
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package size={40} className="mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-700">No products uploaded yet</h4>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
            >
              Upload Product
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">Add New Product to Store</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Noise-Canceling Headphones"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Health">Beauty & Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    placeholder="2499"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image URL / ImageKit CDN</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or ImageKit URL"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Write clear product features and specs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200"
                >
                  {submitting ? 'Creating Product...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}