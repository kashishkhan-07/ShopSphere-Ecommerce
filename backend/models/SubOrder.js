const mongoose = require('mongoose');

const SubOrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 1 },
  image: { type: String, default: '' },
});

const SubOrderSchema = new mongoose.Schema(
  {
    parentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [SubOrderItemSchema],
    subTotal: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    platformCommission: { type: Number, default: 0 },
    adminCommission: { type: Number, default: 0 },
    vendorEarnings: { type: Number, default: 0 },
    fulfillmentStatus: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    shippingCarrier: { type: String, default: 'BlueDart Express' },
    trackingNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubOrder', SubOrderSchema);