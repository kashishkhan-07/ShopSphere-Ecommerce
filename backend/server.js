const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Product = require('./models/Product');
const SubscriptionPlan = require('./models/SubscriptionPlan');

dotenv.config();

// 🚀 In-Process Direct Seeder (Auto-Populates Cloud DB Instantly)
const seedCloudDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) return;

    console.log('🌱 Cloud DB empty. Auto-seeding full marketplace catalog...');

    // 1. Subscription Plans
    const plans = await SubscriptionPlan.create([
      { name: 'Starter Tier', slug: 'starter-free', price: 0, commissionRate: 5.0, maxProducts: 15, features: ['15 Products', '5% Fee'] },
      { name: 'Pro Merchant', slug: 'pro-merchant', price: 999, commissionRate: 2.5, maxProducts: 100, features: ['100 Products', '2.5% Fee'] },
      { name: 'Enterprise Brand', slug: 'enterprise-brand', price: 2999, commissionRate: 1.0, maxProducts: 1000, features: ['Unlimited', '1% Fee'] },
    ]);

    // 2. Users
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
      addresses: [{ fullName: 'Rohan Sharma', street: '402, Technology Park', city: 'Mumbai', state: 'Maharashtra', postalCode: '400076', phone: '+91 98765 43210', country: 'India', isDefault: true }],
    });

    // 3. Vendors
    const vendorTech = await Vendor.create({
      user: vendor1User._id,
      storeName: 'TechZone Hub',
      storeSlug: 'techzone-hub',
      description: 'Mechanical keyboards, studio monitors & high-end audio.',
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
      description: 'Luxury streetwear & Italian leather boots.',
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
      description: 'Organic skincare serums & cleansers.',
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
      description: 'Artisan ceramic sets & cast-iron skillets.',
      logo: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=200',
      isVerified: true,
      subscriptionPlan: plans[1]._id,
      commissionRate: 2.5,
      wallet: { availableBalance: 4200, pendingBalance: 0 },
    });

    // 4. Products
    await Product.create([
      { vendor: vendorTech._id, title: 'Keychron Q1 Pro Custom Wireless Keyboard', description: 'Full aluminum CNC machined body mechanical keyboard.', category: 'Electronics', brand: 'Keychron', price: 16999, discountPrice: 14999, stock: 12, images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' }], rating: 4.9, numReviews: 28, isActive: true, isApproved: true },
      { vendor: vendorTech._id, title: 'Sony WH-1000XM5 Noise Cancelling Headphones', description: 'Industry-leading noise cancellation.', category: 'Electronics', brand: 'Sony', price: 29990, discountPrice: 24990, stock: 8, images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' }], rating: 4.8, numReviews: 45, isActive: true, isApproved: true },
      { vendor: vendorAura._id, title: 'Handcrafted Italian Leather Chelsea Boots', description: 'Full-grain calfskin leather boots.', category: 'Fashion & Apparel', brand: 'Aura Artisans', price: 8999, discountPrice: 6499, stock: 15, images: [{ url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' }], rating: 4.9, numReviews: 32, isActive: true, isApproved: true },
      { vendor: vendorAura._id, title: 'Heavyweight French Terry Oversized Hoodie', description: '450 GSM organic cotton hoodie.', category: 'Fashion & Apparel', brand: 'Aura Studio', price: 3499, discountPrice: 2499, stock: 25, images: [{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600' }], rating: 4.7, numReviews: 19, isActive: true, isApproved: true },
      { vendor: vendorAaina._id, title: 'Organic Vitamin C & Hyaluronic Glow Serum', description: '20% active Vitamin C serum.', category: 'Beauty & Wellness', brand: 'Aaina Naturals', price: 1999, discountPrice: 1299, stock: 40, images: [{ url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' }], rating: 4.9, numReviews: 53, isActive: true, isApproved: true },
      { vendor: vendorUrban._id, title: 'Artisan Matte Ceramic Coffee Mug Set (Pack of 4)', description: 'Lead-free stoneware mugs.', category: 'Home & Kitchen', brand: 'Urban Nest', price: 1999, discountPrice: 1499, stock: 20, images: [{ url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600' }], rating: 4.9, numReviews: 38, isActive: true, isApproved: true },
      { vendor: vendorUrban._id, title: 'Japanese High-Carbon Damascus Santoku Chef Knife', description: '67-layer Damascus steel blade.', category: 'Home & Kitchen', brand: 'Urban Chef', price: 4999, discountPrice: 3499, stock: 14, images: [{ url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600' }], rating: 4.8, numReviews: 24, isActive: true, isApproved: true },
    ]);

    console.log('✅ In-Process Cloud Database Seeding Completed!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

connectDB().then(seedCloudDatabase);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
});
app.set('io', io);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ShopSphere Cloud Gateway Live' });
});

// Force Seed Endpoint (Optional Trigger)
app.get('/api/seed-now', async (req, res) => {
  await seedCloudDatabase();
  res.json({ success: true, message: 'Database Checked & Seeded!' });
});

io.on('connection', (socket) => {
  socket.on('join_conversation', (id) => socket.join(`convo:${id}`));
});

const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res) => res.sendFile(path.resolve(frontendDistPath, 'index.html')));
} else {
  app.use((req, res) => res.send('<h1>ShopSphere API Server Online</h1>'));
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 ShopSphere running on port ${PORT}`);
});