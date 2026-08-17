const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema(
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
      unique: true,
      trim: true,
    },
    storeSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    logo: {
      type: String,
      default: 'https://ik.imagekit.io/shopspheredemo/default-store.png',
    },
    banner: {
      type: String,
      default: 'https://ik.imagekit.io/shopspheredemo/default-banner.png',
    },
    description: {
      type: String,
      default: 'Welcome to our verified merchant store on ShopSphere.',
    },
    kyc: {
      businessRegistrationNumber: { type: String, default: '' },
      taxId: { type: String, default: '' }, // GST or Business Tax ID
      documentUrl: { type: String, default: '' }, // Document uploaded to ImageKit
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      rejectionReason: { type: String, default: '' },
    },
    commissionRate: {
      type: Number,
      default: 10.0, // Default 10% platform commission
    },
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
    },
    subscriptionStatus: {
      type: String,
      enum: ['free', 'active', 'past_due', 'canceled'],
      default: 'free',
    },
    stripeAccountId: {
      type: String,
      default: '',
    },
    wallet: {
      availableBalance: { type: Number, default: 0 },
      pendingBalance: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
    },
    bankAccount: {
      accountHolderName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      routingNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', VendorSchema);