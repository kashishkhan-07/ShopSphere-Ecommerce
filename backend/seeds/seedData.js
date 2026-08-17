const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const SubscriptionPlan = require('../models/SubscriptionPlan');

dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopsphere');
    console.log('[Seeder] Connected to MongoDB...');

    // Clear previous data
    await User.deleteMany();
    await Vendor.deleteMany();
    await Product.deleteMany();
    await SubscriptionPlan.deleteMany();

    // 1. Create SaaS Subscription Plans
    const starterPlan = await SubscriptionPlan.create({
      name: 'Starter Tier',
      slug: 'starter',
      price: 0,
      commissionRate: 12.0,
      maxProducts: 15,
      features: ['Up to 15 Products', '12% Platform Commission', 'Basic Storefront'],
      hasAiChatbot: false,
      hasLiveCustomerChat: false,
    });

    const proPlan = await SubscriptionPlan.create({
      name: 'Professional Tier',
      slug: 'professional',
      price: 1999,
      commissionRate: 5.0,
      maxProducts: 100,
      features: ['Up to 100 Products', '5% Commission', '💬 Live Customer Chat', '🤖 AI Assistant'],
      hasAiChatbot: true,
      hasLiveCustomerChat: true,
    });

    const enterprisePlan = await SubscriptionPlan.create({
      name: 'Enterprise VIP',
      slug: 'enterprise',
      price: 4999,
      commissionRate: 2.0,
      maxProducts: -1,
      features: ['Unlimited Products', '⚡ 2% Commission', '👑 VIP Support', 'Verified Badge'],
      hasAiChatbot: true,
      hasLiveCustomerChat: true,
    });

    // 2. Create Admin
    await User.create({
      name: 'Super Admin',
      email: 'admin@shopsphere.com',
      password: 'password123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    // 3. Create Vendor 1 (TechZone Electronics)
    const vendorUser1 = await User.create({
      name: 'Vikram Mehta',
      email: 'techzone@shopsphere.com',
      password: 'password123',
      role: 'vendor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const vendor1 = await Vendor.create({
      user: vendorUser1._id,
      storeName: 'TechZone Hub',
      storeSlug: 'techzone-hub',
      description: 'Premier authorized retailer for audio gear, mechanical keyboards, and computing accessories.',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      commissionRate: 5.0,
      subscriptionPlan: proPlan._id,
      isVerified: true,
      rating: 4.9,
      numReviews: 38,
      wallet: { availableBalance: 12500, pendingBalance: 4200, totalEarnings: 58000 },
      kyc: { status: 'approved', taxId: 'GSTIN27AAACT9821A1Z5' },
    });

    vendorUser1.vendorProfile = vendor1._id;
    await vendorUser1.save();

    // 4. Create Vendor 2 (Aura Apparel)
    const vendorUser2 = await User.create({
      name: 'Ananya Roy',
      email: 'aurafashion@shopsphere.com',
      password: 'password123',
      role: 'vendor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const vendor2 = await Vendor.create({
      user: vendorUser2._id,
      storeName: 'Aura Apparel',
      storeSlug: 'aura-apparel',
      description: 'Sustainable luxury streetwear and curated artisan accessories.',
      logo: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=200',
      commissionRate: 2.0,
      subscriptionPlan: enterprisePlan._id,
      isVerified: true,
      rating: 4.8,
      numReviews: 24,
      wallet: { availableBalance: 24000, pendingBalance: 6100, totalEarnings: 92000 },
      kyc: { status: 'approved', taxId: 'GSTIN07AAACA4410B1Z8' },
    });

    vendorUser2.vendorProfile = vendor2._id;
    await vendorUser2.save();

    // 5. Create Customer
    await User.create({
      name: 'Rohan Sharma',
      email: 'customer@shopsphere.com',
      password: 'password123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    // 6. Create Seed Products
    await Product.create([
      {
        vendor: vendor1._id,
        title: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise cancellation with 30-hour battery life.',
        category: 'Electronics',
        brand: 'Sony',
        price: 29990,
        discountPrice: 26990,
        stock: 18,
        images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' }],
      },
      {
        vendor: vendor1._id,
        title: 'Keychron Q1 Pro Custom Wireless Keyboard',
        description: 'Full aluminum 75% layout keyboard with RGB and hot-swappable switches.',
        category: 'Electronics',
        brand: 'Keychron',
        price: 16999,
        discountPrice: 14999,
        stock: 12,
        images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800' }],
      },
      {
        vendor: vendor2._id,
        title: 'Oversized Heavyweight French Terry Hoodie',
        description: '450 GSM ultra-dense combed cotton relaxed tailoring hoodie.',
        category: 'Fashion & Apparel',
        brand: 'Aura Collective',
        price: 3499,
        discountPrice: 2899,
        stock: 35,
        images: [{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800' }],
      },
      {
        vendor: vendor2._id,
        title: 'Minimalist Italian Leather Chelsea Boots',
        description: 'Handcrafted Goodyear-welted ankle boots constructed from Tuscan calfskin.',
        category: 'Fashion & Apparel',
        brand: 'Aura Footwear',
        price: 8999,
        discountPrice: 7499,
        stock: 14,
        images: [{ url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800' }],
      },
    ]);

    console.log('✨ [Seeder] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]:', err);
    process.exit(1);
  }
};

seedData();