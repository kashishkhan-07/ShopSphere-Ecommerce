const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Clean Seeding...');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await User.deleteMany();
    await Vendor.deleteMany();
    await Product.deleteMany();
    await SubscriptionPlan.deleteMany();
    await Order.deleteMany();
    await SubOrder.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    console.log('🧹 Old test data purged.');

    // 1. SaaS Plans
    const plans = await SubscriptionPlan.create([
      {
        name: 'Starter Tier',
        slug: 'starter-free',
        price: 0,
        billingCycle: 'monthly',
        commissionRate: 5.0,
        maxProducts: 15,
        features: ['Up to 15 Product Listings', 'Standard Marketplace Search', '5.0% Platform Fee'],
      },
      {
        name: 'Pro Merchant',
        slug: 'pro-merchant',
        price: 999,
        billingCycle: 'monthly',
        commissionRate: 2.5,
        maxProducts: 100,
        features: ['Up to 100 Product Listings', 'Priority Homepage Placement', 'Reduced 2.5% Fee'],
      },
      {
        name: 'Enterprise Brand',
        slug: 'enterprise-brand',
        price: 2999,
        billingCycle: 'monthly',
        commissionRate: 1.0,
        maxProducts: 1000,
        features: ['Unlimited Product Listings', 'Featured Verified Badge', 'Lowest 1.0% Fee'],
      },
    ]);

    // 2. Users (Clean Standard Passwords)
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@shopsphere.io',
      password: 'Password@123',
      role: 'admin',
      phone: '+91 98765 00000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    });

    const vendor1User = await User.create({
      name: 'Vikram Mehta',
      email: 'techzone@shopsphere.io',
      password: 'Password@123',
      role: 'vendor',
      phone: '+91 98765 11111',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    });

    const vendor2User = await User.create({
      name: 'Priya Singhal',
      email: 'aura@shopsphere.io',
      password: 'Password@123',
      role: 'vendor',
      phone: '+91 98765 22222',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    });

    const vendor3User = await User.create({
      name: 'Aaina Kapoor',
      email: 'aaina@shopsphere.io',
      password: 'Password@123',
      role: 'vendor',
      phone: '+91 98765 33333',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    });

    const vendor4User = await User.create({
      name: 'Kabir Verma',
      email: 'urban@shopsphere.io',
      password: 'Password@123',
      role: 'vendor',
      phone: '+91 98765 44444',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    });

    const customerUser = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan@gmail.com',
      password: 'Password@123',
      role: 'customer',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
      addresses: [
        {
          fullName: 'Rohan Sharma',
          street: '402, Technology Park, Powai',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400076',
          phone: '+91 98765 43210',
          country: 'India',
          isDefault: true,
        },
      ],
    });

    // 3. Vendors
    const vendorTech = await Vendor.create({
      user: vendor1User._id,
      storeName: 'TechZone Hub',
      storeSlug: 'techzone-hub',
      description: 'Authorized merchant for mechanical keyboards & studio audio.',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200',
      isVerified: true,
      subscriptionPlan: plans[1]._id,
      commissionRate: 2.5,
      wallet: { availableBalance: 12500, pendingBalance: 0 },
    });

    const vendorAura = await Vendor.create({
      user: vendor2User._id,
      storeName: 'Aura Apparel',
      storeSlug: 'aura-apparel',
      description: 'Handcrafted luxury streetwear & Italian leather boots.',
      logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
      isVerified: true,
      subscriptionPlan: plans[2]._id,
      commissionRate: 1.0,
      wallet: { availableBalance: 8400, pendingBalance: 0 },
    });

    const vendorAaina = await Vendor.create({
      user: vendor3User._id,
      storeName: 'Aaina Care & Beauty',
      storeSlug: 'aaina-care-beauty',
      description: 'Cruelty-free organic skincare serums & botanical cleansers.',
      logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200',
      isVerified: true,
      subscriptionPlan: plans[0]._id,
      commissionRate: 5.0,
      wallet: { availableBalance: 0, pendingBalance: 0 },
    });

    const vendorUrban = await Vendor.create({
      user: vendor4User._id,
      storeName: 'Urban Nest Kitchenware',
      storeSlug: 'urban-nest-kitchenware',
      description: 'Artisan ceramic dining sets, cast-iron skillets & home decor.',
      logo: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=200',
      isVerified: true,
      subscriptionPlan: plans[1]._id,
      commissionRate: 2.5,
      wallet: { availableBalance: 4200, pendingBalance: 0 },
    });

    // 4. Products
    await Product.create([
      // Electronics
      {
        vendor: vendorTech._id,
        title: 'Keychron Q1 Pro Custom Wireless Keyboard',
        description: 'Full aluminum CNC machined body, QMK/VIA programmable hot-swappable mechanical keyboard.',
        category: 'Electronics',
        brand: 'Keychron',
        price: 16999,
        discountPrice: 14999,
        stock: 12,
        images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' }],
        rating: 4.9,
        numReviews: 28,
        isActive: true,
        isApproved: true,
      },
      {
        vendor: vendorTech._id,
        title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        description: 'Industry-leading noise cancellation with 30-hour battery life.',
        category: 'Electronics',
        brand: 'Sony',
        price: 29990,
        discountPrice: 24990,
        stock: 8,
        images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' }],
        rating: 4.8,
        numReviews: 45,
        isActive: true,
        isApproved: true,
      },
      // Fashion
      {
        vendor: vendorAura._id,
        title: 'Handcrafted Italian Leather Chelsea Boots',
        description: 'Full-grain vintage calfskin leather boots with Goodyear welted rubber soles.',
        category: 'Fashion & Apparel',
        brand: 'Aura Artisans',
        price: 8999,
        discountPrice: 6499,
        stock: 15,
        images: [{ url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' }],
        rating: 4.9,
        numReviews: 32,
        isActive: true,
        isApproved: true,
      },
      {
        vendor: vendorAura._id,
        title: 'Heavyweight French Terry Oversized Hoodie',
        description: '450 GSM pure organic combed cotton hoodie with dropped shoulders.',
        category: 'Fashion & Apparel',
        brand: 'Aura Studio',
        price: 3499,
        discountPrice: 2499,
        stock: 25,
        images: [{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600' }],
        rating: 4.7,
        numReviews: 19,
        isActive: true,
        isApproved: true,
      },
      // Beauty
      {
        vendor: vendorAaina._id,
        title: 'Organic Vitamin C & Hyaluronic Glow Serum',
        description: '20% active Ethyl Ascorbic acid enriched with Ferulic acid.',
        category: 'Beauty & Wellness',
        brand: 'Aaina Naturals',
        price: 1999,
        discountPrice: 1299,
        stock: 40,
        images: [{ url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' }],
        rating: 4.9,
        numReviews: 53,
        isActive: true,
        isApproved: true,
      },
      // Kitchen
      {
        vendor: vendorUrban._id,
        title: 'Artisan Matte Ceramic Coffee Mug Set (Pack of 4)',
        description: 'Handcrafted stoneware mugs with natural earth glazes.',
        category: 'Home & Kitchen',
        brand: 'Urban Nest',
        price: 1999,
        discountPrice: 1499,
        stock: 20,
        images: [{ url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600' }],
        rating: 4.9,
        numReviews: 38,
        isActive: true,
        isApproved: true,
      },
    ]);

    console.log('✅ Seed Completed! All accounts have password: Password@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

connectDB().then(seedData);