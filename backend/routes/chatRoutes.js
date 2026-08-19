const express = require('express');
const {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  deleteConversation,
  deleteSingleMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/conversations', protect, getOrCreateConversation);
router.get('/conversations', protect, getUserConversations);
router.delete('/conversations/:conversationId', protect, deleteConversation);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.delete('/messages/:messageId', protect, deleteSingleMessage);

module.exports = router;