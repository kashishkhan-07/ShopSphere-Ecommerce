import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Package,
  Store,
  Truck,
  Clock,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'placed':
        return <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">Order Placed</span>;
      case 'processing':
        return <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">Packing & Processing</span>;
      case 'shipped':
        return <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">Shipped / In Transit</span>;
      case 'delivered':
        return <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Delivered</span>;
      default:
        return <span className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2 py-0.5 rounded-full">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading your order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <Package size={48} className="mx-auto text-slate-300 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No orders placed yet</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Explore our multi-vendor marketplace and complete your first purchase!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Package size={24} className="text-indigo-600" />
          <span>My Orders & Multi-Vendor Tracking ({orders.length})</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Each seller fulfills their portion of your order independently.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Parent Order Header */}
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Placed</span>
                  <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
                  <span className="font-black text-emerald-400">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-slate-300 font-mono px-2.5 py-1 rounded-lg text-[11px]">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck size={12} /> Stripe Escrow Paid
                </span>
              </div>
            </div>

            {/* Split Sub-Orders List */}
            <div className="p-4 sm:p-6 divide-y divide-slate-100">
              {order.subOrders && order.subOrders.map((sub) => (
                <div key={sub._id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store size={16} className="text-indigo-600 shrink-0" />
                      <span className="font-bold text-sm text-slate-800">
                        {sub.vendor?.storeName || 'Verified Merchant Store'}
                      </span>
                    </div>
                    {getStatusBadge(sub.fulfillmentStatus)}
                  </div>

                  {/* Items in this sub-order */}
                  <div className="space-y-2 pl-6">
                    {sub.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={item.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <span className="font-medium text-slate-700">{item.title} × {item.qty}</span>
                        </div>
                        <span className="font-bold text-slate-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Courier Tracking Details */}
                  {sub.shippingCarrier && sub.trackingNumber && (
                    <div className="bg-indigo-50/50 p-2.5 rounded-xl text-xs text-indigo-900 flex items-center justify-between border border-indigo-100 ml-6">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-indigo-600 shrink-0" />
                        <span>Carrier: <strong>{sub.shippingCarrier}</strong> (ID: {sub.trackingNumber})</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}