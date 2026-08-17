import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Store, User, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', initialRole = 'customer' }) {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    storeDescription: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          storeName: formData.storeName,
          storeDescription: formData.storeDescription,
        });
      } else {
        await login(formData.email, formData.password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setLoading(true);
    try {
      await demoLogin(demoRole);
      onClose();
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X size={20} />
        </button>

        {/* Header Tabs */}
        <div className="flex gap-4 border-b border-slate-100 pb-3 mb-6">
          <button
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`text-base font-bold pb-2 transition ${
              !isRegister
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`text-base font-bold pb-2 transition ${
              isRegister
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Demo Login */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            1-Click Instant Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('customer')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold py-1.5 px-2 rounded-xl border border-emerald-200 transition text-center"
            >
              🛍️ Customer
            </button>
            <button
              onClick={() => handleQuickDemo('vendor')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold py-1.5 px-2 rounded-xl border border-indigo-200 transition text-center"
            >
              🏬 Vendor
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold py-1.5 px-2 rounded-xl border border-amber-200 transition text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    role === 'customer'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User size={14} />
                  <span>Buyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    role === 'vendor'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Store size={14} />
                  <span>Seller</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {role === 'vendor' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Store Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Verma Electronics"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-indigo-200 transition"
          >
            {loading ? 'Processing...' : isRegister ? (role === 'vendor' ? 'Open Merchant Store' : 'Sign Up') : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}