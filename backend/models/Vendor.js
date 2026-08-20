const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, 'Please provide a store name'],
      trim: true,
    },
    storeSlug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200',
    },
    commissionRate: {
      type: Number,
      default: 5.0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    vendorStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    wallet: {
      availableBalance: { type: Number, default: 0 },
      pendingBalance: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);