import React, { useState } from 'react';
import api from '../services/api';
import {
  X,
  Check,
  Crown,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const PLANS = [
  {
    slug: 'starter-free',
    name: 'Starter Tier',
    price: 0,
    commission: '5.0%',
    badge: 'Current Plan',
    features: ['Up to 15 Product Listings', 'Standard Marketplace Search', '5% Platform Commission', 'Basic Email Support'],
    isPopular: false,
  },
  {
    slug: 'pro-merchant',
    name: 'Pro Merchant',
    price: 999,
    commission: '2.5%',
    badge: 'Most Popular',
    features: ['Up to 100 Product Listings', 'Priority Homepage Placement', 'Reduced 2.5% Commission', 'AI Customer Chatbot Support', 'Fast Payout Settlement'],
    isPopular: true,
  },
  {
    slug: 'enterprise-brand',
    name: 'Enterprise Brand',
    price: 2999,
    commission: '1.0%',
    badge: 'Best Value',
    features: ['Unlimited Product Listings', 'Featured Verified Seller Badge', 'Lowest 1.0% Commission', 'Custom Store Banner & Domain', '24/7 Dedicated Account Manager'],
    isPopular: false,
  },
];

export default function SubscriptionModal({ isOpen, onClose, currentCommission, onUpgradeSuccess }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro-merchant');

  if (!isOpen) return null;

  const handleUpgrade = async (planSlug) => {
    setLoading(true);
    try {
      const { data } = await api.post('/vendors/upgrade-plan', { planSlug });
      if (onUpgradeSuccess) onUpgradeSuccess(data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[95vh] overflow-y-auto no-scrollbar font-['Plus_Jakarta_Sans',sans-serif]">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1">
          <X size={20} />
        </button>

        <div className="text-center max-w-md mx-auto mb-8">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Crown size={26} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Upgrade Merchant SaaS Plan</h2>
          <p className="text-xs text-slate-500 mt-1">
            Lower your sales commission rates from <strong>5% down to 1%</strong> and unlock unlimited inventory listing power.
          </p>
        </div>

        {/* 3 Tier Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.slug}
              className={`rounded-2xl p-5 border relative flex flex-col justify-between transition ${
                plan.isPopular
                  ? 'border-indigo-600 bg-indigo-50/30 shadow-lg shadow-indigo-100 ring-2 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="font-bold text-sm text-slate-900">{plan.name}</h3>
                <div className="my-3">
                  <span className="text-2xl font-black text-slate-900">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 font-medium"> /month</span>
                </div>

                <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-xl mb-4 border border-emerald-200">
                  ⚡ {plan.commission} Platform Fee
                </div>

                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleUpgrade(plan.slug)}
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  plan.isPopular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>{plan.price === 0 ? 'Current Tier' : 'Upgrade via Stripe'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}