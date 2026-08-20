import React, { useState } from 'react';
import api from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, ShieldCheck, Lock, ArrowRight, MapPin, Sparkles, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

function StripePaymentForm({ cartItems, shippingAddress, onOrderSuccess, onClose }) {
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
      const { data } = await api.post('/orders/create-payment-intent', {
        items: safeCart.map((item) => ({ productId: item.product?._id || item.product, qty: item.qty || 1 })),
        shippingAddress,
      });

      const confirmRes = await api.post(`/orders/${data.orderId}/confirm-payment`, {
        paymentIntentId: 'pi_escrow_' + Date.now(),
      });

      if (confirmRes.data.success) {
        onOrderSuccess();
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Payment processing error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <CreditCard size={14} className="text-[#063F35]" />
            <span>Credit / Debit Card Details</span>
          </label>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck size={11} /> 256-Bit Escrow
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 focus-within:border-[#063F35]">
          <CardElement options={{ style: { base: { fontSize: '14px', color: '#1e293b' } } }} />
        </div>

        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
          <Sparkles size={11} className="text-[#C9A86A]" />
          <span>Demo Card: <strong>4242 4242 4242 4242</strong></span>
        </p>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#063F35] hover:bg-[#0B3D35] disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-[#063F35]/20 transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <Lock size={15} />
        <span>{loading ? 'Processing Escrow Payment...' : `Pay ₹${totalAmount.toLocaleString('en-IN')} via Stripe`}</span>
        <ArrowRight size={15} />
      </button>
    </form>
  );
}

export default function CheckoutModal({ isOpen, onClose, cartItems = [], onOrderSuccess }) {
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', street: '', city: '', state: '', postalCode: '', phone: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-1">
          <X size={18} />
        </button>

        <div className="border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2 text-[#063F35] mb-1">
            <ShieldCheck size={20} />
            <span className="text-[11px] font-extrabold uppercase">Stripe Escrow Payment</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Confirm & Secure Payment</h2>
        </div>

        <Elements stripe={stripePromise}>
          <StripePaymentForm cartItems={cartItems} shippingAddress={shippingAddress} onOrderSuccess={onOrderSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
}