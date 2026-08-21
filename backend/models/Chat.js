const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['buyer', 'vendor'], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  vendorId: { type: String, required: true },
  vendorName: { type: String, default: 'Vendor' },
  storeName: { type: String, default: 'Merchant Store' },
  productTitle: { type: String, default: '' },
  messages: [messageSchema],
  lastMessage: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);