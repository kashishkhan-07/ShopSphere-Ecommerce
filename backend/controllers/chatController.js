const Chat = require('../models/Chat');

// 1. Start or Find Chat (1-on-1 Customer <-> Vendor)
exports.startChat = async (req, res) => {
  try {
    const { customerId, customerName, vendorId, vendorName, storeName, productTitle, initialMessage } = req.body;

    const cId = String(customerId || 'buyer_customer').toLowerCase().trim();
    const sName = storeName || vendorName || 'Vendor Store';
    const vId = String(vendorId || sName).toLowerCase().replace(/\s+/g, '_').trim();

    let chat = await Chat.findOne({
      $or: [
        { customerId: cId, vendorId: vId },
        { customerId: cId, storeName: new RegExp(sName.replace(/_/g, ' '), 'i') },
        { customerId: cId, storeName: new RegExp(sName, 'i') }
      ]
    });

    if (!chat) {
      chat = new Chat({
        customerId: cId,
        customerName: customerName || 'Customer',
        vendorId: vId,
        vendorName: sName,
        storeName: sName,
        productTitle: productTitle || '',
        messages: []
      });
    }

    if (initialMessage && initialMessage.trim() !== '') {
      const msg = {
        senderId: cId,
        senderName: customerName || 'Customer',
        senderRole: 'buyer',
        text: initialMessage,
        createdAt: new Date()
      };
      chat.messages.push(msg);
      chat.lastMessage = initialMessage;
      chat.updatedAt = new Date();
    }

    await chat.save();

    const io = req.app.get('io');
    if (io) {
      io.to(String(chat._id)).emit('chat_started', { chat });
    }

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error('Error starting chat:', error);
    return res.status(500).json({ success: false, message: 'Failed to start chat', error: error.message });
  }
};

// 2. Send Message (Buyer -> Vendor OR Vendor -> Buyer)
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, customerId, vendorId, storeName, senderId, senderName, senderRole, text } = req.body;

    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    }

    if (!chat && customerId && (vendorId || storeName)) {
      const cId = String(customerId).toLowerCase().trim();
      const sName = storeName || 'Vendor Store';
      const vId = String(vendorId || sName).toLowerCase().replace(/\s+/g, '_').trim();

      chat = await Chat.findOne({
        $or: [
          { customerId: cId, vendorId: vId },
          { customerId: cId, storeName: new RegExp(sName, 'i') }
        ]
      });
    }

    if (!chat) {
      const sName = storeName || 'Vendor Store';
      chat = new Chat({
        customerId: String(customerId || 'customer').toLowerCase().trim(),
        customerName: senderName || 'Customer',
        vendorId: String(vendorId || sName).toLowerCase().replace(/\s+/g, '_').trim(),
        vendorName: sName,
        storeName: sName,
        messages: []
      });
    }

    const msg = {
      senderId: senderId || (senderRole === 'buyer' ? chat.customerId : chat.vendorId),
      senderName: senderName || (senderRole === 'buyer' ? chat.customerName : chat.storeName),
      senderRole: senderRole || 'buyer',
      text,
      createdAt: new Date()
    };

    chat.messages.push(msg);
    chat.lastMessage = text;
    chat.updatedAt = new Date();

    await chat.save();

    // ⚡ Socket.IO Real-Time Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(String(chat._id)).emit('receive_message', { chatId: chat._id, message: msg, chat });
    }

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// 3. Get User / Vendor Active Conversations
exports.getUserChats = async (req, res) => {
  try {
    const userId = String(req.params.userId || '').toLowerCase().trim();
    const storeQuery = String(req.query.storeName || '').trim();

    let chats = [];

    if (userId === 'all') {
      chats = await Chat.find({}).sort({ updatedAt: -1 });
    } else {
      const searchTerms = [userId];
      if (userId.includes('_')) {
        searchTerms.push(userId.replace(/_/g, ' '));
      }
      if (storeQuery) {
        searchTerms.push(storeQuery);
        searchTerms.push(storeQuery.toLowerCase().replace(/\s+/g, '_'));
      }

      const regexQueries = searchTerms.map(
        (term) => new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
      );

      chats = await Chat.find({
        $or: [
          { customerId: { $in: searchTerms } },
          { vendorId: { $in: searchTerms } },
          { storeName: { $in: regexQueries } },
          { vendorName: { $in: regexQueries } },
          { customerName: { $in: regexQueries } }
        ]
      }).sort({ updatedAt: -1 });

      if (chats.length === 0) {
        chats = await Chat.find({}).sort({ updatedAt: -1 });
      }
    }

    return res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chats' });
  }
};

// 4. Get Single Chat by ID
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    return res.status(200).json({ success: true, chat });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching chat' });
  }
};