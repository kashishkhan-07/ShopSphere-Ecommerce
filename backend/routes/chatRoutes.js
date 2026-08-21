const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/start', chatController.startChat);
router.post('/send', chatController.sendMessage);
router.get('/user/:userId', chatController.getUserChats);
router.get('/:chatId', chatController.getChatById);

module.exports = router;