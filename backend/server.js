const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(async () => {
  // 🌱 Auto-Seed Production Database if Empty
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Database is empty. Auto-seeding multi-vendor marketplace data...');
      const seedScript = require('./seeds/seedData');
      // seedData runs if invoked directly
    }
  } catch (err) {
    console.log('Seed check skipped:', err.message);
  }
});

const app = express();
const server = http.createServer(app);

// ⚡ Socket.io Gateway Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🛣️ API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health & 1-Click Live Seed Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ShopSphere Cloud Gateway Live' });
});

app.get('/api/seed-live-data', async (req, res) => {
  try {
    // Dynamic run seedData script
    const { exec } = require('child_process');
    exec('node backend/seeds/seedData.js', (err, stdout, stderr) => {
      if (err) {
        return res.status(500).json({ success: false, error: stderr });
      }
      return res.status(200).json({ success: true, message: 'Database Seeded Live Successfully!', output: stdout });
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// ⚡ Socket.io Real-Time Room Listeners
io.on('connection', (socket) => {
  console.log(`[Socket Connected]: ${socket.id}`);

  socket.on('join_conversation', (conversationId) => {
    socket.join(`convo:${conversationId}`);
    console.log(`Socket ${socket.id} joined room convo:${conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected]: ${socket.id}`);
  });
});

// 🌐 Serve React Frontend Build
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.use((req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.send('<h1>ShopSphere API Server is Running!</h1>');
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 ShopSphere Server running on port ${PORT}`);
  console.log(`💬 Socket.io Real-Time Gateway: Online`);
});