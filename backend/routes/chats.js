const express = require('express');
const router = express.Router();
const Chat = require('../db/Models/chat');
const User = require('../db/Models/user');
const logger = require('../utils/logger');

// Helper function to emit real-time notification
const emitToUser = (io, userId, event, data) => {
  const onlineUsers = io.onlineUsers || {};
  const userSocketIds = onlineUsers[userId];
  if (userSocketIds && userSocketIds.length > 0) {
    userSocketIds.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    });
  }
};

// Get all chats for a user
router.get('/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.params.userId })
      .populate('participants', 'name _id')
      .populate('messages.sender', 'name _id');
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

// Send friend request using username
router.post('/friend-request', async (req, res, next) => {
  const { fromUserId, toUsername } = req.body;
  try {
    const io = req.app.get('io');
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findOne({ username: toUsername });
    
    if (!toUser) {
      logger.warn('Friend request to non-existent user', { username: toUsername });
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (toUser._id.toString() === fromUserId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }
    
    if (toUser.friends.includes(fromUserId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }
    
    if (!toUser.friendRequests.includes(fromUserId)) {
      toUser.friendRequests.push(fromUserId);
      await toUser.save();
      
      // Emit real-time notification to the recipient
      if (io) {
        emitToUser(io, toUser._id.toString(), 'friend_request_received', {
          _id: fromUser._id,
          name: fromUser.name,
          username: fromUser.username,
          profile: fromUser.profile,
        });
      }
      
      logger.info('Friend request sent', { from: fromUserId, to: toUser._id });
    }
    
    res.json({ message: 'Friend request sent' });
  } catch (err) {
    logger.error('Error sending friend request', { error: err.message });
    next(err);
  }
});

// Accept friend request
router.post('/accept-friend', async (req, res, next) => {
  const { userId, friendId } = req.body;
  try {
    const io = req.app.get('io');
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    
    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.friendRequests.includes(friendId)) {
      user.friends.push(friendId);
      user.friendRequests = user.friendRequests.filter(id => id != friendId);
      await user.save();
      friend.friends.push(userId);
      await friend.save();

      // Start chat if not exists
      let chat = await Chat.findOne({
        participants: { $all: [userId, friendId], $size: 2 }
      });
      if (!chat) {
        chat = new Chat({ participants: [userId, friendId], messages: [] });
        await chat.save();
      }
      
      // Emit real-time notification to the friend
      if (io) {
        emitToUser(io, friendId, 'friend_request_accepted', {
          _id: user._id,
          name: user.name,
          username: user.username,
          profile: user.profile,
          chatId: chat._id,
        });
      }
      
      logger.info('Friend request accepted', { userId, friendId });
      res.json({ message: 'Friend request accepted', chatId: chat._id });
    } else {
      res.status(400).json({ message: 'No such friend request' });
    }
  } catch (err) {
    logger.error('Error accepting friend request', { error: err.message });
    next(err);
  }
});

// Reject friend request
router.post('/reject-friend', async (req, res, next) => {
  const { userId, friendId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.friendRequests = user.friendRequests.filter(id => id != friendId);
    await user.save();
    
    logger.info('Friend request rejected', { userId, friendId });
    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    logger.error('Error rejecting friend request', { error: err.message });
    next(err);
  }
});

// Start a new chat
router.post('/start-chat', async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, friendId], $size: 2 }
    });
    if (!chat) {
      chat = new Chat({ participants: [userId, friendId], messages: [] });
      await chat.save();
    }
    const chats = await Chat.find({ participants: userId }).populate('participants', 'name _id profile');
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ message: 'Error starting chat' });
  }
});

module.exports = router;