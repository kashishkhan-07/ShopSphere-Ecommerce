import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Phone, ArrowRight, AlertCircle, ShoppingBag, Store, ShieldCheck, Building, Clock } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    storeName: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(formData.email, formData.password);
        if (res?.user?.role === 'vendor') {
          if (res.user.vendorStatus === 'pending') {
            setMessage({ type: 'warning', text: 'Your vendor account is pending approval by the administrator.' });
            setLoading(false);
            return;
          }
          if (res.user.vendorStatus === 'rejected') {
            setMessage({ type: 'error', text: 'Your vendor application has been rejected by the administrator.' });
            setLoading(false);
            return;
          }
        }
        onClose();
      } else {
        const res = await register(formData);
        if (formData.role === 'vendor') {
          setMessage({ type: 'info', text: 'Registration successful. Your vendor account is pending approval by the administrator.' });
          setLoading(false);
          return;
        }
        onClose();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Authentication failed. Please check credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setMessage({ type: 'error', text: 'Demo login failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-1">
          <X size={18} />
        </button>

        <div className="flex gap-4 border-b border-slate-100 pb-3 mb-5">
          <button onClick={() => { setIsLogin(true); setMessage({ type: '', text: '' }); }} className={`text-lg font-black pb-1 cursor-pointer ${isLogin ? 'text-[#063F35] border-b-2 border-[#063F35]' : 'text-slate-400'}`}>Sign In</button>
          <button onClick={() => { setIsLogin(false); setMessage({ type: '', text: '' }); }} className={`text-lg font-black pb-1 cursor-pointer ${!isLogin ? 'text-[#063F35] border-b-2 border-[#063F35]' : 'text-slate-400'}`}>Create Account</button>
        </div>

        {isLogin && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">1-Click Instant Demo Login:</span>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => handleQuickLogin('rohan@gmail.com', 'Password@123')} className="bg-emerald-50 text-[#063F35] text-xs font-bold py-2 rounded-xl border border-emerald-200">Buyer</button>
              <button type="button" onClick={() => handleQuickLogin('techzone@shopsphere.io', 'Password@123')} className="bg-amber-50 text-amber-800 text-xs font-bold py-2 rounded-xl border border-amber-200">Vendor</button>
              <button type="button" onClick={() => handleQuickLogin('admin@shopsphere.io', 'Password@123')} className="bg-slate-900 text-white text-xs font-bold py-2 rounded-xl">Admin</button>
            </div>
          </div>
        )}

        {message.text && (
          <div className={`p-3.5 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 border ${
            message.type === 'info' || message.type === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {message.type === 'info' || message.type === 'warning' ? <Clock size={16} className="shrink-0 text-amber-600" /> : <AlertCircle size={16} className="shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Select Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, role: 'customer' })} className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${formData.role === 'customer' ? 'bg-emerald-50 border-[#063F35] text-[#063F35]' : 'bg-slate-50 text-slate-600'}`}>
                  <ShoppingBag size={14} /> Customer (Buyer)
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, role: 'vendor' })} className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${formData.role === 'vendor' ? 'bg-emerald-50 border-[#063F35] text-[#063F35]' : 'bg-slate-50 text-slate-600'}`}>
                  <Store size={14} /> Vendor (Seller)
                </button>
              </div>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input type="text" required placeholder="Khushi Sharma" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5" />
            </div>
          )}

          {!isLogin && formData.role === 'vendor' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Store / Business Name</label>
              <input type="text" required placeholder="Aura Lifestyle & Crafts" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5" />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <input type="email" required placeholder="name@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5" />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Password</label>
            <input type="password" required placeholder="••••••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#063F35] text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
            <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}