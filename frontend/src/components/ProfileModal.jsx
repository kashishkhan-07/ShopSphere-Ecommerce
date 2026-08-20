import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { X, User, Phone, MapPin, Check, AlertCircle, Save } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
];

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const defaultAddr = user?.addresses?.[0] || {};

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || AVATAR_PRESETS[0],
    street: defaultAddr.street || '',
    city: defaultAddr.city || '',
    state: defaultAddr.state || '',
    postalCode: defaultAddr.postalCode || '',
  });

  useEffect(() => {
    if (user) {
      const addr = user.addresses?.[0] || {};
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || AVATAR_PRESETS[0],
        street: addr.street || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postalCode || '',
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        avatar: formData.avatar,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India',
        },
      };

      const { data } = await api.put('/auth/updatedetails', payload);
      if (data.success) {
        updateUser(data.user);
        setMessage({ type: 'success', text: 'Profile & Address updated successfully!' });
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">

        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer">
          <X size={18} />
        </button>

        <h2 className="text-xl font-black text-slate-900 mb-1">Edit Profile & Shipping Address</h2>
        <p className="text-xs text-slate-400 mb-6">Manage your account details and primary delivery address.</p>

        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Avatar Presets */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Select Avatar</label>
            <div className="flex items-center gap-3">
              {AVATAR_PRESETS.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: imgUrl })}
                  className={`relative rounded-full p-0.5 transition cursor-pointer ${
                    formData.avatar === imgUrl ? 'ring-2 ring-[#063F35] scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                  {formData.avatar === imgUrl && (
                    <span className="absolute bottom-0 right-0 bg-[#063F35] text-white p-0.5 rounded-full">
                      <Check size={10} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
              <input
                type="tel"
                maxLength={10}
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35]"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-[#063F35] uppercase mb-3 flex items-center gap-1.5">
              <MapPin size={14} /> Default Shipping Address
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Flat / Building / Street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="400076"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.replace(/\D/g, '') })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:border-[#063F35]"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#063F35] hover:bg-[#0B3D35] text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-[#063F35]/20 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Save size={15} />
            <span>{loading ? 'Saving Changes...' : 'Save Profile & Address'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}