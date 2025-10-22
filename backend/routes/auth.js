const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../db/Models/user');

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email','https://www.googleapis.com/auth/drive.file'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    // If user exists, redirect to frontend dashboard
    if (req.user && req.user.username) {
      const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });
      res.user = req.user;
      res.redirect('https://heloware.vercel.app');
    } else {
      // Store Google info in session for later use
      req.session.googleProfile = req.user;
      res.redirect(`https://heloware.vercel.app/username-prompt?email=${encodeURIComponent(req.user.email)}&name=${encodeURIComponent(req.user.name)}&profile=${encodeURIComponent(req.user.profile)}`);
    }
  }
);

router.post('/username', async (req, res) => {
    const { username } = req.body;
    // Get Google info from session
    const googleProfile = req.session.googleProfile;
    if (!googleProfile) {
        return res.status(400).json({ message: "Google profile missing. Please login again." });
    }
    if(!username){
        return res.status(400).json({ message: "Username is required." });
    }
    const existingUser = await User.findOne({ username });
    if(existingUser){
        return res.status(400).json({ message: "Username already taken." });
    }
    const user = await new User({
        username,
        email: googleProfile.email,
        name: googleProfile.name,
        OAuth: googleProfile.OAuth,
        profile: googleProfile.profile,
    }).save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });
    // Clear session after use
    req.session.googleProfile = null;
    res.status(200).json({ message: "User created successfully", user });
});

router.post('/email', async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({ message: "Email and Password are required." });
    }
    const user = await User.findOne({ email: email });
    if(!user){
        return res.status(400).json({ message: "User not found." });
    }
    if(user.password !== password){
        return res.status(400).json({ message: "Invalid Password." });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });

    res.status(200).json({ message: "Login Successful", user });
});

router.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;
    if(!name || !email || !password || !username){
        return res.status(400).json({ message: "Name, Username, Email and Password are required." });
    }
    var existingUser = await User.findOne({ email: email });
    if(existingUser){
        return res.status(400).json({ message: "User email already exists." });
    }
    existingUser = await User.findOne({ username: username });
    if(existingUser){
        return res.status(400).json({ message: "Username already exists." });
    }
    const newUser = new User({
        name,
        username,
        email,
        password
    });
    await newUser.save();
    res.status(201).json({ message: "User Registered Successfully", user: newUser});
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decoded.id).select("-password"); // hide password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "Lax" });
  return res.status(200).json({ message: "Logged out successfully" });
});

router.post('/set-username', async (req, res) => {
  const { email, username, name, profile } = req.body;
  try {
    // Check if username is taken
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    // Create user
    const user = new User({
      name,
      email,
      username,
      profile,
      friends: [],
      friendRequests: [],
    });
    await user.save();
    req.login(user, err => {
      if (err) return res.status(500).json({ message: 'Login failed' });
      res.json({ message: 'Username set and user created' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error setting username' });
  }
});


module.exports = router