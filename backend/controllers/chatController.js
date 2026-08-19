const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    1. Get or Create a Private Conversation
// @route   POST /api/chat/conversations
// @access  Private
exports.getOrCreateConversation = async (req, res) => {
  try {
    let { recipientId, vendorId, productId, type } = req.body;
    const currentUser = req.user;
    const currentUserId = currentUser.id.toString();

    // 🚫 Strict Block: Customer cannot initiate vendor-admin chats
    if (currentUser.role === 'customer' && type === 'vendor_admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin channel is reserved for verified store merchants only.',
      });
    }

    let targetUserId = null;
    let finalVendorId = vendorId;

    // 👑 CASE 1: Vendor <-> Admin Communication
    if (type === 'vendor_admin' || currentUser.role === 'admin') {
      if (currentUser.role === 'admin') {
        // Admin talking to Vendor
        if (vendorId) {
          const v = await Vendor.findById(vendorId);
          if (v && v.user) {
            targetUserId = (v.user._id || v.user).toString();
            finalVendorId = v._id;
          }
        }
        if (!targetUserId && recipientId) {
          const v = await Vendor.findById(recipientId);
          if (v && v.user) {
            targetUserId = (v.user._id || v.user).toString();
            finalVendorId = v._id;
          } else {
            targetUserId = recipientId.toString();
          }
        }
      } else if (currentUser.role === 'vendor') {
        // Vendor talking to Admin
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
          return res.status(404).json({ success: false, message: 'Admin support user not found' });
        }
        targetUserId = adminUser._id.toString();
        const v = await Vendor.findOne({ user: currentUser.id });
        if (v) finalVendorId = v._id;
      }
    }
    // 🛍️ CASE 2: Customer <-> Vendor Communication
    else {
      if (vendorId) {
        const v = await Vendor.findById(vendorId);
        if (v && v.user) {
          targetUserId = (v.user._id || v.user).toString();
          finalVendorId = v._id;
        }
      }

      if (!targetUserId && recipientId) {
        const v = await Vendor.findById(recipientId);
        if (v && v.user) {
          targetUserId = (v.user._id || v.user).toString();
          finalVendorId = v._id;
        } else {
          targetUserId = recipientId.toString();
        }
      }
    }

    if (!targetUserId || targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'Cannot start conversation with yourself' });
    }

    // 🔍 Find existing conversation between these 2 users
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
      ...(type ? { type } : {}),
    })
      .populate('participants', 'name email role avatar')
      .populate('vendor', 'storeName logo')
      .populate('product', 'title price images');

    // If not exists, create new
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, targetUserId],
        type: type || (currentUser.role === 'admin' ? 'vendor_admin' : 'customer_vendor'),
        vendor: finalVendorId || null,
        product: productId || null,
        lastMessage: type === 'vendor_admin' ? 'Support channel initiated' : 'Conversation started',
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email role avatar')
        .populate('vendor', 'storeName logo')
        .populate('product', 'title price images');
    }

    return res.status(200).json({ success: true, conversation });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    2. Get Conversations (Strict Role-Filtered Inboxes)
// @route   GET /api/chat/conversations
// @access  Private
exports.getUserConversations = async (req, res) => {
  try {
    let query = { participants: req.user.id };

    // 🔒 Customer ONLY sees 'customer_vendor' chats (Never sees admin chats)
    if (req.user.role === 'customer') {
      query.type = 'customer_vendor';
    }
    // 🔒 Admin ONLY sees 'vendor_admin' chats
    else if (req.user.role === 'admin') {
      query.type = 'vendor_admin';
    }

    const conversations = await Conversation.find(query)
      .populate('participants', 'name email role avatar')
      .populate('vendor', 'storeName logo')
      .populate('product', 'title price images')
      .sort({ lastMessageTimestamp: -1 });

    return res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    3. Get Messages (Protected)
// @route   GET /api/chat/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const userIdStr = req.user.id.toString();
    const isParticipant = conversation.participants.some(
      (p) => (p._id || p).toString() === userIdStr
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, count: messages.length, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    4. Send Message (Protected)
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const userIdStr = req.user.id.toString();
    const isParticipant = conversation.participants.some(
      (p) => (p._id || p).toString() === userIdStr
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to send message here' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      content: content.trim(),
      readBy: [req.user.id],
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content.trim(),
      lastMessageTimestamp: new Date(),
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`convo:${conversationId}`).emit('receive_message', message);
    }

    return res.status(201).json({ success: true, message });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    5. Delete Conversation
// @route   DELETE /api/chat/conversations/:conversationId
// @access  Private
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const userIdStr = req.user.id.toString();
    const isParticipant = conversation.participants.some(
      (p) => (p._id || p).toString() === userIdStr
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Message.deleteMany({ conversation: conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    6. Delete Single Message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
exports.deleteSingleMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own messages' });
    }

    const conversationId = message.conversation;
    await Message.findByIdAndDelete(messageId);

    const io = req.app.get('io');
    if (io) {
      io.to(`convo:${conversationId}`).emit('message_deleted', { messageId, conversationId });
    }

    return res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};