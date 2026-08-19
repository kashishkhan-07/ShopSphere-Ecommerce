const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { Server } = require('socket.io');
const aiRoutes = require('./routes/aiRoutes');
// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Smart CORS Allowed Origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5173/',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5173/',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS to Express
app.use(cors(corsOptions));

// ⚡ Initialize Socket.io
const io = new Server(server, {
  cors: corsOptions,
});

// Pass `io` to express app for controllers
app.set('io', io);

// Socket.io Real-Time Gateway Event Listeners
io.on('connection', (socket) => {
  console.log(`[Socket Connected]: ${socket.id}`);

  socket.on('join_user_room', (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(`convo:${conversationId}`);
    console.log(`[Socket]: Joined conversation room convo:${conversationId}`);
  });

  socket.on('typing_start', ({ conversationId, userName }) => {
    socket.to(`convo:${conversationId}`).emit('user_typing', { userName, isTyping: true });
  });

  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(`convo:${conversationId}`).emit('user_typing', { isTyping: false });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected]: ${socket.id}`);
  });
});

// Middlewares
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'ShopSphere Multi-Vendor SaaS API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

//  Serve Frontend in Production Mode
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 ShopSphere Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Socket.io Real-Time Gateway: Online`);
  console.log(`===================================================`);
});

module.exports = { app, server, io };