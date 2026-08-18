import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import api from '../services/api';
import {
  X,
  CreditCard,
  ShieldCheck,
  Lock,
  Truck,
  Store,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// Initialize Stripe instance
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51MockShopSpherePublishableKey2026'
);

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '14px',
      color: '#1e293b',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      '::placeholder': { color: '#94a3b8' },
      iconColor: '#6366f1',
    },
    invalid: {
      color: '#e11d48',
      iconColor: '#e11d48',
    },
  },
};

function CheckoutForm({ cart, totalAmount, user, onClose, onOrderSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '9876543210',
    street: user?.addresses?.[0]?.street || '402, Technology Park',
    city: user?.addresses?.[0]?.city || 'Mumbai',
    state: user?.addresses?.[0]?.state || 'Maharashtra',
    postalCode: user?.addresses?.[0]?.postalCode || '400001',
    country: 'India',
  });

  // Group items by vendor for transparency
  const vendorBreakdown = cart.reduce((acc, item) => {
    const vName = item.vendor?.storeName || 'Verified Merchant';
    if (!acc[vName]) acc[vName] = [];
    acc[vName].push(item);
    return acc;
  }, {});

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');

    if (!address.fullName || !address.street || !address.city || !address.postalCode) {
      setError('Please fill in complete shipping address details');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Payment Intent on Backend
      const { data: intentData } = await api.post('/orders/create-payment-intent', {
        items: cart,
      });

      let paymentIntentId = intentData.paymentIntentId;

      // 2. If real Stripe is configured, confirm with Stripe.js
      if (stripe && elements && intentData.clientSecret && !intentData.clientSecret.startsWith('mock_')) {
        const cardElement = elements.getElement(CardElement);
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          intentData.clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: address.fullName,
                phone: address.phone,
              },
            },
          }
        );

        if (stripeError) {
          setError(stripeError.message);
          setLoading(false);
          return;
        }

        paymentIntentId = paymentIntent.id;
      }

      // 3. ⚡ Trigger Auto Order-Splitting Algorithm on Backend
      const { data: splitResult } = await api.post('/orders/confirm-and-split', {
        items: cart,
        shippingAddress: address,
        paymentIntentId,
        totalAmount: intentData.totalAmount || totalAmount,
      });

      setSuccessOrder(splitResult.order);
      if (onOrderSuccess) onOrderSuccess(splitResult.order);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🎉 Order Success Confirmation Screen
  if (successOrder) {
    return (
      <div className="p-6 sm:p-8 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
          <CheckCircle2 size={36} />
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Stripe Payment Verified (Paid)
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-3">Order Confirmed!</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Your payment of <strong>₹{totalAmount.toLocaleString('en-IN')}</strong> was escrowed and split into separate sub-orders for each merchant.
        </p>

        <div className="my-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Order ID:</span>
            <span className="font-mono font-bold text-slate-800">#{successOrder._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Delivery Address:</span>
            <span className="font-semibold text-slate-800">{address.city}, {address.state}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Independent Sub-Orders:</span>
            <span className="font-bold text-indigo-600">{Object.keys(vendorBreakdown).length} Merchant Packages</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl shadow-md shadow-indigo-200 transition"
        >
          View My Orders & Track Delivery
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="p-5 sm:p-7 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Unified Stripe Checkout</h3>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>256-bit Encrypted Escrow Payment</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          <X size={18} />
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Multi-Vendor Order Summary Breakdown */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
          Multi-Vendor Package Breakdown ({Object.keys(vendorBreakdown).length} Sellers):
        </span>
        <div className="space-y-2">
          {Object.entries(vendorBreakdown).map(([vendorName, items]) => (
            <div key={vendorName} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <Store size={14} className="text-indigo-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">{vendorName}</span>
                  <span className="text-[10px] text-slate-400 block">{items.length} item(s)</span>
                </div>
              </div>
              <span className="font-extrabold text-slate-900">
                ₹{items.reduce((s, i) => s + (i.discountPrice || i.price) * (i.qty || 1), 0).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 Shipping Address */}
      <div className="space-y-2">
        <span className="block text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
          <Truck size={14} className="text-indigo-600" />
          <span>Shipping & Delivery Details</span>
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            required
            placeholder="Recipient Full Name"
            value={address.fullName}
            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
          />
          <input
            type="tel"
            required
            placeholder="Phone Number"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
          />
        </div>
        <input
          type="text"
          required
          placeholder="Street Address / Flat / Building"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            required
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
          />
          <input
            type="text"
            required
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
          />
          <input
            type="text"
            required
            placeholder="PIN Code"
            value={address.postalCode}
            onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* 💳 Stripe Secure Card Box */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center">
          <span className="block text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
            <CreditCard size={14} className="text-indigo-600" />
            <span>Card Information (Stripe Secure)</span>
          </span>
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Test Mode 4242</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-indigo-500 transition">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Total & Submit Button */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-slate-500 font-medium">Total Charge (Inclusive of Taxes)</span>
          <span className="text-xl font-black text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Processing Escrow Payment...</span>
          ) : (
            <>
              <span>Authorize & Pay ₹{totalAmount.toLocaleString('en-IN')}</span>
              <Sparkles size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function CheckoutModal({ isOpen, onClose, cart, user, onOrderSuccess }) {
  if (!isOpen || cart.length === 0) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * (item.qty || 1),
    0
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 relative max-h-[95vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Elements stripe={stripePromise}>
          <CheckoutForm
            cart={cart}
            totalAmount={totalAmount}
            user={user}
            onClose={onClose}
            onOrderSuccess={onOrderSuccess}
          />
        </Elements>
      </div>
    </div>
  );
}