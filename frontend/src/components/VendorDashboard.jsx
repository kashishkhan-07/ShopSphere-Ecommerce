import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Store,
  Package,
  Plus,
  MessageCircle,
  ShieldCheck,
  X,
  AlertCircle,
  Clock,
  Ban,
  Camera,
  Check,
  Edit2,
  Trash2,
  Upload,
  CheckCircle
} from 'lucide-react';

const CATEGORY_FALLBACKS = {
  Fashion: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600',
  Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
  Beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
};

const STORE_LOGO_PRESETS = [
  { name: 'Fashion Boutique', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300' },
  { name: 'Tech Store', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300' },
  { name: 'Beauty Care', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300' },
  { name: 'Home Decor', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300' },
];

export default function VendorDashboard({ onOpenAdminChat }) {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [newLogoUrl, setNewLogoUrl] = useState('');

  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: 'Fashion',
    brand: '',
    price: '',
    discountPrice: '',
    stock: '15',
    image: '',
  });

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/vendors/me');
      setVendor(data.vendor);
      setNewLogoUrl(data.vendor?.logo || '');
      if (data.vendor?.vendorStatus === 'approved') {
        fetchMyProducts();
      }
    } catch (err) {
      console.error('Fetch vendor error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const { data } = await api.get('/products/my-products');
      setProducts(data.products || []);
    } catch (err) {
      console.error('Fetch my products error:', err);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const sanitizeImageUrl = (url, category) => {
    if (!url || typeof url !== 'string' || !url.trim()) {
      return CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.Fashion;
    }
    let clean = url.trim();
    if (clean.includes('unsplash.com/photos/')) {
      if (clean.includes('jeans') || clean.includes('denim')) return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600';
      if (clean.includes('shirt') || clean.includes('tshirt')) return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600';
      if (clean.includes('shoe') || clean.includes('sneaker')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';
      return CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.Fashion;
    }
    return clean;
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrorMsg('');

    const finalImageUrl = sanitizeImageUrl(productForm.image, productForm.category);

    try {
      if (editingProduct) {
        const { data } = await api.put(`/products/${editingProduct._id}`, {
          ...productForm,
          image: finalImageUrl,
        });
        if (data.success) {
          setEditingProduct(null);
          setShowAddProductModal(false);
          showToast(`Product "${productForm.title}" updated successfully! ✨`);
          fetchMyProducts();
        }
      } else {
        const { data } = await api.post('/products', {
          ...productForm,
          image: finalImageUrl,
        });
        if (data.success) {
          setShowAddProductModal(false);
          // 📦 Merchant Specific Toast (NO "Added to Cart")
          showToast(`Product "${productForm.title}" published to store catalog! 📦`);
          fetchMyProducts();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title || '',
      description: product.description || '',
      category: product.category || 'Fashion',
      brand: product.brand || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      stock: product.stock || '15',
      image: product.images?.[0]?.url || '',
    });
    setShowAddProductModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setSubmitLoading(true);
    try {
      await api.delete(`/products/${deletingProduct._id}`);
      showToast(`Product "${deletingProduct.title}" deleted from catalog.`);
      setDeletingProduct(null);
      fetchMyProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateStoreLogo = async (e) => {
    e.preventDefault();
    if (!newLogoUrl) return;
    setSubmitLoading(true);
    try {
      const { data } = await api.put('/vendors/me', { logo: newLogoUrl });
      if (data.success) {
        setVendor(data.vendor);
        setShowLogoModal(false);
        showToast('Store profile picture updated successfully! 📸');
      }
    } catch (err) {
      alert('Failed to update store logo');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs font-['Plus_Jakarta_Sans',sans-serif]">Loading vendor store dashboard...</div>;
  }

  const status = vendor?.vendorStatus || 'pending';

  if (status === 'pending') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="bg-white rounded-3xl border border-amber-200 p-8 sm:p-12 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto">
            <Clock size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Application Pending Approval</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your vendor account for <strong>"{vendor?.storeName}"</strong> is pending approval by the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif] relative">

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#063F35] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-[#C9A86A]">
          <CheckCircle size={16} className="text-[#C9A86A]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 🏬 Store Header */}
      <div className="bg-[#063F35] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => setShowLogoModal(true)} title="Click to change profile picture">
            <img
              src={vendor?.logo || STORE_LOGO_PRESETS[0].url}
              alt="Store Logo"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C9A86A] shadow-md group-hover:opacity-80 transition"
            />
            <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera size={16} className="text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{vendor?.storeName}</h1>
              <span className="bg-[#C9A86A]/20 text-[#C9A86A] border border-[#C9A86A]/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} /> APPROVED MERCHANT ({vendor?.commissionRate || 5.0}%)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{vendor?.description}</p>
            <button onClick={() => setShowLogoModal(true)} className="text-[10px] text-[#C9A86A] font-bold underline mt-1 block cursor-pointer">
              Change Store Profile Picture
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({ title: '', description: '', category: 'Fashion', brand: '', price: '', discountPrice: '', stock: '15', image: '' });
              setShowAddProductModal(true);
            }}
            className="bg-[#C9A86A] hover:bg-[#D4B67B] text-[#063F35] text-xs font-black px-4 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Pending Escrow</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹{(vendor?.wallet?.pendingBalance || 0).toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Available Payout</span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">₹{(vendor?.wallet?.availableBalance || 0).toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Listed Products</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{products.length} Items</h3>
        </div>
      </div>

      {/* Inventory Table (Strictly Edit & Delete Actions - No Add to Cart) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Package size={18} className="text-[#063F35]" />
            <span>Store Products Inventory</span>
          </h3>
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({ title: '', description: '', category: 'Fashion', brand: '', price: '', discountPrice: '', stock: '15', image: '' });
              setShowAddProductModal(true);
            }}
            className="text-xs font-bold text-[#063F35] cursor-pointer"
          >
            <Plus size={14} className="inline" /> Add Product
          </button>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase">
                  <th className="py-2.5 px-2">Product Name</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2">Selling Price</th>
                  <th className="py-2.5 px-2">Stock</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {products.map((p) => {
                  const imgUrl = sanitizeImageUrl(p.images?.[0]?.url, p.category);
                  return (
                    <tr key={p._id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-2 flex items-center gap-3">
                        <img
                          src={imgUrl}
                          alt={p.title}
                          onError={(e) => {
                            e.target.src = CATEGORY_FALLBACKS[p.category] || CATEGORY_FALLBACKS.Fashion;
                          }}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-bold text-slate-900">{p.title}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-500">{p.category}</td>
                      <td className="py-3 px-2 font-black text-slate-900">₹{(p.discountPrice || p.price).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-2 font-bold text-slate-700">{p.stock} units</td>
                      <td className="py-3 px-2 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-600 hover:text-[#063F35] hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">No products listed in your store yet.</div>
        )}
      </div>

      {/* 🖼️ Store Profile Picture Editor Modal */}
      {showLogoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative font-['Plus_Jakarta_Sans',sans-serif]">
            <button onClick={() => setShowLogoModal(false)} className="absolute top-5 right-5 text-slate-400">
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-1">Update Store Profile Picture</h3>
            <p className="text-xs text-slate-400 mb-4">Choose a preset store logo, upload a file from your device, or paste a URL.</p>

            <div className="space-y-4">
              {/* Option A: Presets */}
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">Preset Brand Logos:</span>
                <div className="grid grid-cols-4 gap-2">
                  {STORE_LOGO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewLogoUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition cursor-pointer aspect-square ${
                        newLogoUrl === preset.url ? 'border-[#063F35] scale-105 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {newLogoUrl === preset.url && (
                        <div className="absolute inset-0 bg-[#063F35]/40 flex items-center justify-center text-white">
                          <Check size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option B: Local File Upload */}
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Upload File from Device:</span>
                <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 cursor-pointer transition">
                  <Upload size={16} className="text-[#063F35]" />
                  <span>Choose Image File...</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Option C: Custom Image URL */}
              <form onSubmit={handleUpdateStoreLogo} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Custom Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={newLogoUrl}
                    onChange={(e) => setNewLogoUrl(e.target.value)}
                    className="w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5"
                  />
                </div>
                <button type="submit" disabled={submitLoading} className="w-full bg-[#063F35] text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer shadow-md shadow-[#063F35]/20">
                  {submitLoading ? 'Saving Store Profile...' : 'Save Store Profile Picture'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 📦 Add/Edit Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative font-['Plus_Jakarta_Sans',sans-serif]">
            <button onClick={() => setShowAddProductModal(false)} className="absolute top-5 right-5 text-slate-400">
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-1">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <p className="text-xs text-slate-400 mb-4">{editingProduct ? 'Update product pricing, stock and details.' : 'List a new product on ShopSphere marketplace.'}</p>

            {errorMsg && <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl mb-3 flex items-center gap-2"><AlertCircle size={15} /><span>{errorMsg}</span></div>}

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Product Title</label>
                <input type="text" required placeholder="e.g. Denim Slim Jeans" value={productForm.title} onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2.5" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2.5">
                    <option value="Fashion">Fashion</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Stock Qty</label>
                  <input type="number" required value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Original Price (₹)</label>
                  <input type="number" required placeholder="600" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Selling Price (₹)</label>
                  <input type="number" placeholder="550" value={productForm.discountPrice} onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Product Image URL</label>
                <input type="url" placeholder="Paste image link or leave blank" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2.5" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Product specs and features..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none overflow-hidden focus:bg-white focus:outline-none focus:border-[#063F35]"
                />
              </div>

              <button type="submit" disabled={submitLoading} className="w-full bg-[#063F35] hover:bg-[#0B3D35] text-white font-bold py-3.5 rounded-xl cursor-pointer shadow-md shadow-[#063F35]/20 mt-2">
                {submitLoading ? 'Saving...' : editingProduct ? 'Save Product Changes' : 'Publish Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative font-['Plus_Jakarta_Sans',sans-serif]">
            <button onClick={() => setDeletingProduct(null)} className="absolute top-4 right-4 text-slate-400 p-1">
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Product?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to permanently delete <strong>"{deletingProduct.title}"</strong> from your store catalog?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDeletingProduct(null)} className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={submitLoading} className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 shadow-md cursor-pointer">
                {submitLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}