const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const User = require('../db/Models/user');
const logger = require('../utils/logger');

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email','https://www.googleapis.com/auth/drive.file'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    try {
      // If user exists, redirect to frontend dashboard
      if (req.user && req.user.username) {
        const token = jwt.sign({ id: req.user._id, email: req.user.email }, process.env.SECRET, { expiresIn: '7d' });
        
        // Set secure cookie based on environment
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, { 
          httpOnly: true, 
          secure: isProduction, 
          sameSite: isProduction ? 'None' : 'Lax',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Store token and user info in session for frontend to retrieve
        req.session.authToken = token;
        req.session.authUser = {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          username: req.user.username,
          profile: req.user.profile
        };
        
        logger.info('User logged in via Google OAuth', { userId: req.user._id });
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
      } else {
        // Store Google info in session for later use
        req.session.googleProfile = req.user;
        res.redirect(`${process.env.FRONTEND_URL}/username-prompt?email=${encodeURIComponent(req.user.email)}&name=${encodeURIComponent(req.user.name)}&profile=${encodeURIComponent(req.user.profile)}`);
      }
    } catch (error) {
      logger.error('Google OAuth callback error', { error: error.message });
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

router.post('/username', async (req, res, next) => {
    try {
        const { username } = req.body;
        
        // Get Google info from session
        const googleProfile = req.session.googleProfile;
        if (!googleProfile) {
            return res.status(400).json({ message: "Google profile missing. Please login again." });
        }
        
        if(!username || username.trim().length < 3){
            return res.status(400).json({ message: "Username must be at least 3 characters." });
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

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET, { expiresIn: '7d' });
        
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: isProduction, 
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        // Clear session after use
        req.session.googleProfile = null;
        
        logger.info('User created username after OAuth', { userId: user._id, username });
        res.status(200).json({ message: "User created successfully", user, token });
    } catch (error) {
        logger.error('Username creation error', { error: error.message });
        next(error);
    }
});

router.post('/email', [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res, next) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { email, password } = req.body;
        
        const user = await User.findOne({ email: email });
        if(!user){
            return res.status(401).json({ message: "Invalid email or password." });
        }
        
        // Check if user has a password (not OAuth user)
        if(!user.password){
            return res.status(401).json({ message: "Please use Google Sign-In for this account." });
        }
        
        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            logger.warn('Failed login attempt', { email });
            return res.status(401).json({ message: "Invalid email or password." });
        }
        
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET, { expiresIn: '7d' });
        
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: isProduction, 
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        logger.info('User logged in via email', { userId: user._id });
        res.status(200).json({ message: "Login Successful", user, token });
    } catch (error) {
        logger.error('Email login error', { error: error.message });
        next(error);
    }
});

router.post('/signup', [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res, next) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, username, email, password } = req.body;
        
        // Check existing user
        var existingUser = await User.findOne({ email: email });
        if(existingUser){
            return res.status(400).json({ message: "User email already exists." });
        }
        
        existingUser = await User.findOne({ username: username });
        if(existingUser){
            return res.status(400).json({ message: "Username already exists." });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.SECRET, { expiresIn: '7d' });
        
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: isProduction, 
            sameSite: isProduction ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        logger.info('New user registered', { userId: newUser._id, username });
        res.status(201).json({ message: "User Registered Successfully", user: newUser, token });
    } catch (error) {
        logger.error('Signup error', { error: error.message });
        next(error);
    }
});

router.get("/me", async (req, res, next) => {
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

    res.status(200).json({ user, token });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      logger.warn('Invalid or expired token', { error: err.message });
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    logger.error('Auth validation error', { error: err.message });
    next(err);
  }
});

router.post("/logout", (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie("token", { 
      httpOnly: true, 
      secure: isProduction, 
      sameSite: isProduction ? 'None' : 'Lax'
    });
    logger.info('User logged out', { userId: req.user?._id });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    return res.status(500).json({ message: "Logout failed" });
  }
});

// Retrieve OAuth session data (for frontend to get token after OAuth redirect)
router.get("/oauth-session", (req, res) => {
  try {
    if (req.session.authToken && req.session.authUser) {
      const token = req.session.authToken;
      const user = req.session.authUser;
      
      // Clear session data after retrieval
      req.session.authToken = null;
      req.session.authUser = null;
      
      return res.status(200).json({ user, token });
    }
    return res.status(404).json({ message: "No OAuth session found" });
  } catch (error) {
    logger.error('OAuth session retrieval error', { error: error.message });
    return res.status(500).json({ message: "Failed to retrieve session" });
  }
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