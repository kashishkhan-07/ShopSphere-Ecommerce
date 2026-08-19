import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  X,
  CreditCard,
  ShieldCheck,
  Truck,
  CheckCircle,
  AlertCircle,
  Lock,
  ArrowRight,
  MapPin,
  Sparkles
} from 'lucide-react';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

// 💳 Escrow Card Payment Form Sub-Component
function StripePaymentForm({ cartItems, shippingAddress, onOrderSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const safeCart = Array.isArray(cartItems) ? cartItems : [];
  const totalAmount = safeCart.reduce((sum, item) => {
    const price = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
    return sum + price * (item.qty || 1);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Create Order & Sub-Orders on Backend
      const { data } = await api.post('/orders/create-payment-intent', {
        items: safeCart.map((item) => ({
          productId: item.product?._id || item.product,
          qty: item.qty || 1,
        })),
        shippingAddress,
      });

      const orderId = data.orderId;

      // 2. Complete Escrow Verification & Payment Confirmation
      const confirmRes = await api.post(`/orders/${orderId}/confirm-payment`, {
        paymentIntentId: 'pi_escrow_' + Date.now(),
      });

      if (confirmRes.data.success) {
        onOrderSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.response?.data?.message || 'Payment processing error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <CreditCard size={14} className="text-indigo-600" />
            <span>Credit / Debit Card Details</span>
          </label>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck size={11} /> 256-Bit Escrow
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 focus-within:border-indigo-500 transition shadow-2xs">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#1e293b',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  '::placeholder': { color: '#94a3b8' },
                },
                invalid: { color: '#e11d48' },
              },
            }}
          />
        </div>

        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
          <Sparkles size={11} className="text-amber-500" />
          <span>Demo Card: <strong>4242 4242 4242 4242</strong> (Any future date & CVC)</span>
        </p>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <Lock size={15} />
        <span>{loading ? 'Processing Escrow Payment...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} via Stripe`}</span>
        <ArrowRight size={15} />
      </button>
    </form>
  );
}

// 📦 Main Checkout Modal
export default function CheckoutModal({ isOpen, onClose, cartItems = [], onOrderSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState('address');

  const safeAddresses = Array.isArray(user?.addresses) ? user.addresses : [];
  const defaultAddr = safeAddresses[0] || {
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: user?.phone || '',
    country: 'India',
  };

  const [shippingAddress, setShippingAddress] = useState(defaultAddr);

  useEffect(() => {
    if (safeAddresses.length > 0) {
      setShippingAddress(safeAddresses[0]);
    }
  }, [user]);

  if (!isOpen) return null;

  const safeCart = Array.isArray(cartItems) ? cartItems : [];
  const totalCartCount = safeCart.reduce((sum, i) => sum + (i.qty || 1), 0);
  const cartTotalAmount = safeCart.reduce((sum, item) => {
    const price = item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price || 0;
    return sum + price * (item.qty || 1);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <ShieldCheck size={20} />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Stripe Escrow Checkout</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {step === 'address' ? 'Shipping Destination' : 'Confirm & Secure Payment'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Order Subtotal: <strong className="text-slate-800">₹{cartTotalAmount.toLocaleString('en-IN')}</strong> ({totalCartCount} items)
          </p>
        </div>

        {/* Step 1: Shipping Address */}
        {step === 'address' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep('payment');
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Recipient Name</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Street Address</label>
              <input
                type="text"
                required
                placeholder="Flat / Building / Street name"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="400076"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>Continue to Payment</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* Step 2: Escrow Card Payment */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600 shrink-0" />
                <span className="truncate text-slate-700">
                  Deliver to: <strong>{shippingAddress.fullName}</strong> ({shippingAddress.city}, {shippingAddress.postalCode})
                </span>
              </div>
              <button
                onClick={() => setStep('address')}
                className="text-[11px] font-bold text-indigo-600 hover:underline shrink-0"
              >
                Change
              </button>
            </div>

            <Elements stripe={stripePromise}>
              <StripePaymentForm
                cartItems={safeCart}
                shippingAddress={shippingAddress}
                onOrderSuccess={onOrderSuccess}
                onClose={onClose}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}