import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Check,
  LogOut,
  ChevronDown,
  AlertCircle,
  Camera,
  Sparkles
} from 'lucide-react';

const COUNTRIES = [
  { code: '+91', name: 'India', flag: 'https://flagcdn.com/w40/in.png' },
  { code: '+1', name: 'United States', flag: 'https://flagcdn.com/w40/us.png' },
  { code: '+44', name: 'United Kingdom', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: '+971', name: 'UAE', flag: 'https://flagcdn.com/w40/ae.png' },
  { code: '+1', name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png' },
  { code: '+61', name: 'Australia', flag: 'https://flagcdn.com/w40/au.png' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
];

export default function ProfileModal({ isOpen, onClose, onLogoutClick }) {
  const { user, isVendor, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const initialPhone = user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '';
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true&size=128`;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    phone: initialPhone,
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    postalCode: user?.addresses?.[0]?.postalCode || '',
  });

  if (!isOpen || !user) return null;

  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: onlyDigits });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.phone && formData.phone.length !== 10) {
      setErrorMsg('Mobile number must be strictly 10 numeric digits');
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formData.phone ? `${selectedCountry.code} ${formData.phone}` : '';
      await api.put('/auth/update-profile', {
        ...formData,
        phone: formattedPhone,
      });

      setSuccessMsg('Profile & Avatar saved successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[95vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-['Plus_Jakarta_Sans',sans-serif]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X size={18} />
        </button>

        {/* User Header Profile */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-4">
          <div className="relative">
            <img
              src={formData.avatar || user.avatar || fallbackAvatar}
              alt={user.name}
              onError={(e) => { e.target.src = fallbackAvatar; }}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm shrink-0"
            />
            {isEditing && (
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow-md">
                <Camera size={12} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                isAdmin
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : isVendor
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Mail size={12} /> {user.email}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl mb-3 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-2.5 rounded-xl mb-3 flex items-center gap-2">
            <Check size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* View Mode */}
        {!isEditing ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Contact Phone</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Phone size={13} className="text-indigo-600" />
                  {user.phone || 'Not added yet'}
                </span>
              </div>

              <div className="flex items-start justify-between pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Default Address</span>
                <div className="text-right max-w-[200px]">
                  <span className="font-semibold text-slate-800 block">
                    {user.addresses?.[0]?.street || 'No street added'}
                  </span>
                  <span className="text-slate-500 text-[11px] block">
                    {user.addresses?.[0]?.city ? `${user.addresses[0].city}, ${user.addresses[0].state || ''} - ${user.addresses[0].postalCode || ''}` : 'Address not set'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={() => { onClose(); onLogoutClick(); }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* ✏️ Edit Mode with Avatar & Presets */
          <form onSubmit={handleSave} className="space-y-3">
            {/* 📸 Profile Picture Upload & Presets */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                  <Camera size={13} className="text-indigo-600" />
                  <span>Profile Picture URL</span>
                </label>
                <span className="text-[10px] text-slate-400">Or pick preset below</span>
              </div>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 focus:outline-none"
              />

              {/* 🎨 1-Click Preset Avatars */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" /> Presets:
                </span>
                {PRESET_AVATARS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt="Preset"
                    onClick={() => setFormData({ ...formData, avatar: preset })}
                    className={`w-7 h-7 rounded-full object-cover cursor-pointer border-2 transition ${
                      formData.avatar === preset ? 'border-indigo-600 scale-110' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
              />
            </div>

            {/* 10-Digit Mobile with Flag */}
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Mobile Number</label>
                <span className="text-[10px] text-slate-400 font-medium">10 Digits</span>
              </div>

              <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition">
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-2 border-r border-slate-200 rounded-l-xl focus:outline-none shrink-0"
                >
                  <img
                    src={selectedCountry.flag}
                    alt={selectedCountry.name}
                    className="w-4 h-3 rounded-xs object-cover shadow-xs"
                  />
                  <span className="text-xs font-bold text-slate-700">{selectedCountry.code}</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full text-xs bg-transparent px-3 py-2 focus:outline-none text-slate-800 tracking-wider font-medium"
                />

                {isCountryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1 max-h-48 overflow-y-auto">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c);
                          setIsCountryDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-indigo-50 text-left transition"
                      >
                        <div className="flex items-center gap-2">
                          <img src={c.flag} alt={c.name} className="w-5 h-3.5 rounded-xs object-cover border border-slate-100" />
                          <span className="text-xs text-slate-800 font-medium">{c.name}</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Street Address</label>
              <input
                type="text"
                placeholder="Flat / Building / Area"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="PIN"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
              >
                {loading ? 'Saving...' : 'Save Profile & Avatar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}