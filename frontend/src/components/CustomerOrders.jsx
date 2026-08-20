import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Package,
  Truck,
  Clock,
  ShieldCheck,
  Ban,
  X,
  AlertTriangle
} from 'lucide-react';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null, orderTotal: 0 });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/my-orders');
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModal.orderId) return;
    setActionLoading(true);
    try {
      await api.patch(`/orders/${cancelModal.orderId}/cancel`);
      setCancelModal({ isOpen: false, orderId: null, orderTotal: 0 });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formattedDate} • ${formattedTime}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package size={24} className="text-[#063F35]" />
            <span>My Orders & Delivery Tracking</span>
          </h1>
          <p className="text-xs text-slate-500">Real-time courier progress and order cancellation management.</p>
        </div>
        <span className="bg-emerald-50 text-[#063F35] text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
          {orders.length} Total Orders
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading order history...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const isRefunded = order.paymentStatus === 'refunded';
            const canCancel = !isRefunded && order.subOrders?.every((s) => s.fulfillmentStatus === 'placed' || s.fulfillmentStatus === 'processing');

            return (
              <div key={order._id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">

                {/* 🌙 Deep Emerald Order Header */}
                <div className="bg-[#063F35] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-300 font-bold uppercase block tracking-wider">Placed Date & Time</span>
                      <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} className="text-[#C9A86A]" />
                        <span>{formatDateTime(order.createdAt)}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-300 font-bold uppercase block tracking-wider">Total Paid</span>
                      <span className="font-black text-[#C9A86A] text-sm block mt-0.5">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-slate-300 text-xs font-bold">#{order._id.slice(-8).toUpperCase()}</span>

                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      isRefunded ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-[#C9A86A]/20 text-[#C9A86A] border-[#C9A86A]/30'
                    }`}>
                      <ShieldCheck size={12} />
                      <span>{isRefunded ? 'Refunded to Escrow' : 'Stripe Escrow Paid'}</span>
                    </span>

                    {canCancel && (
                      <button
                        onClick={() => setCancelModal({ isOpen: true, orderId: order._id, orderTotal: order.totalAmount })}
                        className="bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-bold px-3 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ml-2"
                      >
                        <Ban size={12} />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Orders */}
                <div className="divide-y divide-slate-100 p-5 space-y-4">
                  {order.subOrders?.map((sub) => (
                    <div key={sub._id} className="pt-3 first:pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">🏬 Store: {sub.vendor?.storeName || 'Merchant'}</span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          sub.fulfillmentStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          sub.fulfillmentStatus === 'cancelled' ? 'bg-slate-100 text-slate-500 border-slate-200 line-through' :
                          sub.fulfillmentStatus === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {sub.fulfillmentStatus}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {sub.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                              <div>
                                <h4 className="font-bold text-slate-800">{item.title}</h4>
                                <span className="text-[10px] text-slate-400">Qty: {item.qty}</span>
                              </div>
                            </div>
                            <span className="font-black text-slate-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {sub.trackingNumber && (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-600 flex items-center gap-2">
                          <Truck size={14} className="text-[#063F35] shrink-0" />
                          <span>Carrier: <strong>{sub.shippingCarrier}</strong> | Tracking ID: <strong className="font-mono text-[#063F35]">{sub.trackingNumber}</strong></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <Package size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center relative font-['Plus_Jakarta_Sans',sans-serif]">
            <button onClick={() => setCancelModal({ isOpen: false, orderId: null, orderTotal: 0 })} className="absolute top-4 right-4 text-slate-400">
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Cancel Order?</h3>
            <p className="text-xs text-slate-500 mb-4">Your payment of <strong>₹{cancelModal.orderTotal.toLocaleString('en-IN')}</strong> will be instantly refunded from Escrow.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setCancelModal({ isOpen: false, orderId: null, orderTotal: 0 })} className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100">Keep Order</button>
              <button onClick={handleConfirmCancel} disabled={actionLoading} className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 shadow-md">{actionLoading ? 'Cancelling...' : 'Yes, Cancel Order'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}