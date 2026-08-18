const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { Server } = require('socket.io');

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

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io for real-time chat
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io Real-Time Connection Gateway
io.on('connection', (socket) => {
  console.log(`[Socket Connected]: ${socket.id}`);

  // User joins their personal room
  socket.on('join_user_room', (userId) => {
    socket.join(`user:${userId}`);
  });

  // Join a specific chat room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`convo:${conversationId}`);
  });

  // Send message
  socket.on('send_message', (data) => {
    const { conversationId, message } = data;
    io.to(`convo:${conversationId}`).emit('receive_message', message);
  });

  // Typing indicators
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
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

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

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 ShopSphere Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});

module.exports = { app, server, io };