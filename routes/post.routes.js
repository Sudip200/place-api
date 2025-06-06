const express = require('express');
const router = express.Router();

const {
  postMessage,
  getMessages,
  sendMessageBtw,
  getMessagesAll,
} = require('../controllers/message.controller');

const auth = require('../middlewares/auth.middlewares');
const { createPost, allPosts } = require('../controllers/post.controller');

// Protected routes for messaging
router.post('/message', auth, postMessage);
router.get('/messages', auth, getMessages);
router.post('/sendmessage', auth, sendMessageBtw);
router.post('/allmessages', auth, getMessagesAll);
router.post('/create-post',auth,createPost)
router.get('/all-posts',auth,allPosts)

module.exports = router;
