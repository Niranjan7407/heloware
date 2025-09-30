const express = require('express');
const router = express.Router();
const User = require('../db/Models/user');
const jwt = require('jsonwebtoken');

// When creating or updating a user, use req.body.username
router.post('/register', async (req, res) => {
  const { username, email, profile, OAuth } = req.body;
  if (!username) return res.status(400).json({ message: 'Username required' });
  let user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: 'User already exists' });
  user = new User({ username, email, profile, OAuth });
  await user.save();
  // Issue JWT token
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });
  res.json({ user, token });
});

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

// Get friend requests for a user (returns user objects)
router.get('/:userId/friend-requests', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('friendRequests', 'name _id profile');
    res.json({ friendRequests: user.friendRequests });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching friend requests' });
  }
});

const initialState = {
  byId: {},
  username: null,
  email: null,
  // ...other fields...
};


module.exports = router;