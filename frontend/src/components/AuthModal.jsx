import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Store,
  User,
  AlertCircle,
  MapPin,
  Eye,
  EyeOff,
  ChevronDown
} from 'lucide-react';

const COUNTRIES = [
  { code: '+91', name: 'India', flag: 'https://flagcdn.com/w40/in.png' },
  { code: '+1', name: 'United States', flag: 'https://flagcdn.com/w40/us.png' },
  { code: '+44', name: 'United Kingdom', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: '+971', name: 'UAE', flag: 'https://flagcdn.com/w40/ae.png' },
  { code: '+1', name: 'Canada', flag: 'https://flagcdn.com/w40/ca.png' },
  { code: '+61', name: 'Australia', flag: 'https://flagcdn.com/w40/au.png' },
  { code: '+49', name: 'Germany', flag: 'https://flagcdn.com/w40/de.png' },
  { code: '+65', name: 'Singapore', flag: 'https://flagcdn.com/w40/sg.png' },
];

export default function AuthModal({ isOpen, onClose, initialMode = 'login', initialRole = 'customer' }) {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddressFields, setShowAddressFields] = useState(false);

  // 👁️ Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false);

  // 🇮🇳 Country Selector State
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    storeName: '',
  });

  if (!isOpen) return null;

  // 🔢 Strict 10-Digit Numeric Filter
  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: onlyDigits });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Phone validation: Must be strictly 10 digits
    if (isRegister && formData.phone && formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const formattedPhone = formData.phone ? `${selectedCountry.code} ${formData.phone}` : '';
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          phone: formattedPhone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          storeName: formData.storeName,
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
      {/* Modal Card */}
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[95vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X size={18} />
        </button>

        {/* Header Tabs */}
        <div className="flex gap-4 border-b border-slate-100 pb-2 mb-4">
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
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 mb-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            1-Click Instant Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('customer')}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold py-1 px-2 rounded-xl border border-emerald-200 transition text-center"
            >
              🛍️ Customer
            </button>
            <button
              onClick={() => handleQuickDemo('vendor')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-semibold py-1 px-2 rounded-xl border border-indigo-200 transition text-center"
            >
              🏬 Vendor
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold py-1 px-2 rounded-xl border border-amber-200 transition text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl mb-3 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          {isRegister && (
            <>
              {/* Buyer / Seller Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-1">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    role === 'customer'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User size={13} />
                  <span>Buyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`py-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                    role === 'vendor'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Store size={13} />
                  <span>Seller</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {role === 'vendor' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Store Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Verma Electronics"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* 🇮🇳 HD Flag Country Selector & 10-Digit Mobile */}
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Mobile Number</label>
                  <span className="text-[10px] text-slate-400 font-medium">10 Digits</span>
                </div>

                <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition">
                  {/* Custom Country Flag Button */}
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

                  {/* 10-Digit Phone Input */}
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

                  {/* Custom Flag Dropdown Popover */}
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
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* 👁️ Password Box with Show / Hide Feature */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Optional Address Dropdown */}
          {isRegister && (
            <div>
              <button
                type="button"
                onClick={() => setShowAddressFields(!showAddressFields)}
                className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-1"
              >
                <MapPin size={13} />
                <span>{showAddressFields ? '- Hide Address Details' : '+ Add Address Details (Optional)'}</span>
              </button>

              {showAddressFields && (
                <div className="space-y-1.5 mt-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Street / House No"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="PIN / Postal Code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-200 transition"
          >
            {loading ? 'Processing...' : isRegister ? (role === 'vendor' ? 'Open Merchant Store' : 'Sign Up') : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}