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
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
    async (req, res) => {
    if (await User.findOne({ email: req.user.email })) {
      // Already in DB → send them straight to dashboard
      res.redirect('http://localhost:5173/dashboard');
    } else {
      // Not yet in DB → send them to choose username
      res.redirect('http://localhost:5173/username');
    }
  }
);

router.post('/username', async (req, res) => {
    const { userName } = req.body;
    
    if(!userName){
        return res.status(400).json({ message: "Username is required." });
    }
    const existingUser = await User.findOne({ userName: userName });
    if(existingUser){
        return res.status(400).json({ message: "Username already taken." });
    }
    const user = await new User({
        userName,
        email: req.user.email,
        name: req.user.name,
        OAuth: req.user.OAuth,
        profile: req.user.profile,
    }).save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });
    
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
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });

    res.status(200).json({ message: "Login Successful", user });
});

router.post('/register', async (req, res) => {
    const { name, userName, email, password } = req.body;
    if(!name || !email || !password || !userName){
        return res.status(400).json({ message: "Name, Username, Email and Password are required." });
    }
    const existingUser = await User.findOne({ email: email });
    if(existingUser){
        return res.status(400).json({ message: "User already exists." });
    }
    const newUser = new User({
        name,
        userName,
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

module.exports = router