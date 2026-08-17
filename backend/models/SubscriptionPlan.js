const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // e.g. 'Starter Tier', 'Professional Tier', 'Enterprise VIP'
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true, // Monthly price (0 for Free/Starter, 1999 for Pro, 4999 for Enterprise)
    },
    billingInterval: {
      type: String,
      enum: ['month', 'year'],
      default: 'month',
    },
    commissionRate: {
      type: Number,
      required: true, // e.g. Starter: 12%, Pro: 5%, Enterprise: 2%
    },
    maxProducts: {
      type: Number,
      required: true, // e.g. 15 for Starter, 100 for Pro, -1 for Unlimited
    },
    features: [
      {
        type: String,
      },
    ],
    hasAiChatbot: {
      type: Boolean,
      default: true,
    },
    hasLiveCustomerChat: {
      type: Boolean,
      default: true,
    },
    hasAdvancedAnalytics: {
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

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);