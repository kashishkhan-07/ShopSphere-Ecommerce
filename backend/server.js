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

// 🚀 Automatic Seeder for Fresh Cloud Deployments
const seedDatabase = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`📦 Database already has ${count} products.`);
      return;
    }

    console.log('🌱 Cloud Database is empty! Auto-seeding 5 verified vendors & catalog...');

    const plans = await SubscriptionPlan.create([
      { name: 'Starter Tier', slug: 'starter-free', price: 0, commissionRate: 5.0, maxProducts: 15, features: ['15 Products', '5% Fee'] },
      { name: 'Pro Merchant', slug: 'pro-merchant', price: 999, commissionRate: 2.5, maxProducts: 100, features: ['100 Products', '2.5% Fee'] },
      { name: 'Enterprise Brand', slug: 'enterprise-brand', price: 2999, commissionRate: 1.0, maxProducts: 1000, features: ['Unlimited', '1% Fee'] },
    ]);

    const admin = await User.create({
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

    const customer = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan@gmail.com',
      password: 'Password@123',
      role: 'customer',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
      addresses: [{ fullName: 'Rohan Sharma', street: '402, Technology Park', city: 'Mumbai', state: 'Maharashtra', postalCode: '400076', phone: '+91 98765 43210', country: 'India', isDefault: true }],
    });

    const vTech = await Vendor.create({
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

    const vAura = await Vendor.create({
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

    await Product.create([
      { vendor: vTech._id, title: 'Keychron Q1 Pro Custom Wireless Keyboard', description: 'Full aluminum CNC machined mechanical keyboard.', category: 'Electronics', brand: 'Keychron', price: 16999, discountPrice: 14999, stock: 12, images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600' }], rating: 4.9, numReviews: 28, isActive: true, isApproved: true },
      { vendor: vTech._id, title: 'Sony WH-1000XM5 Noise Cancelling Headphones', description: 'Industry-leading noise cancellation.', category: 'Electronics', brand: 'Sony', price: 29990, discountPrice: 24990, stock: 8, images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600' }], rating: 4.8, numReviews: 45, isActive: true, isApproved: true },
      { vendor: vAura._id, title: 'Handcrafted Italian Leather Chelsea Boots', description: 'Full-grain calfskin leather boots.', category: 'Fashion & Apparel', brand: 'Aura Artisans', price: 8999, discountPrice: 6499, stock: 15, images: [{ url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' }], rating: 4.9, numReviews: 32, isActive: true, isApproved: true },
      { vendor: vAura._id, title: 'Heavyweight French Terry Oversized Hoodie', description: '450 GSM organic cotton hoodie.', category: 'Fashion & Apparel', brand: 'Aura Studio', price: 3499, discountPrice: 2499, stock: 25, images: [{ url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600' }], rating: 4.7, numReviews: 19, isActive: true, isApproved: true },
    ]);

    console.log('✅ Cloud Database Seeded Successfully with Products & Accounts!');
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
};

connectDB().then((connected) => {
  if (connected) seedDatabase();
});

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