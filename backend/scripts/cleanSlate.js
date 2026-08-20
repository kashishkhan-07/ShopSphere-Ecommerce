const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');

const cleanSlate = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shopsphere';
    await mongoose.connect(mongoUri);
    console.log('🔄 Connected to MongoDB for Clean Slate Reset...');

    // 1. Delete all old products
    const deletedProducts = await Product.deleteMany({});
    console.log(`🗑️ Deleted ${deletedProducts.deletedCount} old products.`);

    // 2. Delete all old vendor profiles
    const deletedVendors = await Vendor.deleteMany({});
    console.log(`🗑️ Deleted ${deletedVendors.deletedCount} old vendor stores.`);

    // 3. Delete old vendor user accounts (Keeps Customer & Admin intact)
    const deletedVendorUsers = await User.deleteMany({ role: 'vendor' });
    console.log(`🗑️ Deleted ${deletedVendorUsers.deletedCount} old vendor user accounts.`);

    // 4. Clear old demo orders & sub-orders
    await Order.deleteMany({});
    await SubOrder.deleteMany({});
    console.log('🗑️ Cleared old demo order history.');

    console.log('\n✅ DATABASE CLEAN SLATE SUCCESSFUL! 🚀');
    console.log('Aapka marketplace ab 100% Clean hai (0 Vendors & 0 Products).');
    process.exit(0);
  } catch (err) {
    console.error('❌ Clean slate error:', err);
    process.exit(1);
  }
};

cleanSlate();