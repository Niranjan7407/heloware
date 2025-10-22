const express = require('express');
const router = express.Router();
const Chat = require('../db/Models/chat');
const User = require('../db/Models/user');

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
router.post('/friend-request', async (req, res) => {
  const { fromUserId, toUsername } = req.body;
  console.log('Friend request:', { fromUserId, toUsername });
  try {
    const toUser = await User.findOne({ username: toUsername });
    if (!toUser) {
      console.log('User not found:', toUsername);
      return res.status(404).json({ message: 'User not found' });
    }
    if (!toUser.friendRequests.includes(fromUserId)) {
      toUser.friendRequests.push(fromUserId);
      await toUser.save();
    }
    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending friend request' });
  }
});

// Accept friend request
router.post('/accept-friend', async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
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

      res.json({ message: 'Friend request accepted', chatId: chat._id });
    } else {
      res.status(400).json({ message: 'No such friend request' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error accepting friend request' });
  }
});

// Reject friend request
router.post('/reject-friend', async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await User.findById(userId);
    user.friendRequests = user.friendRequests.filter(id => id != friendId);
    await user.save();
    res.json({ message: 'Friend request rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting friend request' });
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