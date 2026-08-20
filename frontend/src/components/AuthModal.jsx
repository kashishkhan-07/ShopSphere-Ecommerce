import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  Store,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError('Demo login failed. Make sure database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-slate-100 pb-3 mb-5">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`text-lg font-black pb-1 transition relative cursor-pointer ${
              isLogin ? 'text-[#063F35]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In
            {isLogin && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#063F35] rounded-full" />}
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`text-lg font-black pb-1 transition relative cursor-pointer ${
              !isLogin ? 'text-[#063F35]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Create Account
            {!isLogin && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#063F35] rounded-full" />}
          </button>
        </div>

        {/* ⚡ 1-Click Instant Demo Login (On Sign In Tab) */}
        {isLogin && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 mb-4 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              1-Click Instant Demo Persona Logins:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('rohan@gmail.com', 'Password@123')}
                className="flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-[#063F35] border border-emerald-200 text-xs font-bold py-2 rounded-xl transition cursor-pointer"
              >
                <ShoppingBag size={13} />
                <span>Buyer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('techzone@shopsphere.io', 'Password@123')}
                className="flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold py-2 rounded-xl transition cursor-pointer"
              >
                <Store size={13} />
                <span>Vendor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@shopsphere.io', 'Password@123')}
                className="flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer"
              >
                <ShieldCheck size={13} className="text-[#C9A86A]" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3 flex items-center gap-2 mb-4">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">

          {/* 👥 Role Selection on Create Account */}
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Select Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'customer' })}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    formData.role === 'customer'
                      ? 'bg-emerald-50 border-[#063F35] text-[#063F35] shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag size={14} />
                  <span>Customer (Buyer)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'vendor' })}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    formData.role === 'vendor'
                      ? 'bg-emerald-50 border-[#063F35] text-[#063F35] shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Store size={14} />
                  <span>Vendor (Seller)</span>
                </button>
              </div>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Khushi Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35] transition"
                />
              </div>
            </div>
          )}

          {!isLogin && formData.role === 'vendor' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Store / Business Name</label>
              <div className="relative">
                <Building size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Lifestyle & Crafts"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35] transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">10-Digit Mobile Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35] transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#063F35] hover:bg-[#0B3D35] disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-[#063F35]/20 transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}