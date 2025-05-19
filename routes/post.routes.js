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
router.post('/post/message', auth, postMessage);
router.get('/post/messages', auth, getMessages);
router.post('/post/sendmessage', auth, sendMessageBtw);
router.post('/post/allmessages', auth, getMessagesAll);
router.post('/post/create-post',auth,createPost)
router.get('/post/all-posts',auth,allPosts)

module.exports = router;
