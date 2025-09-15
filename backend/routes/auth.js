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
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login', session: false }),
    (req, res) => {
        const user = req.user;
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });
        res.redirect('http://localhost:5173');
    }
);

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
    res.status(200).json({ message: "Login Successful" });
});

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if(!name || !email || !password){
        return res.status(400).json({ message: "Name, Email and Password are required." });
    }
    const existingUser = await User.findOne({ email: email });
    if(existingUser){
        return res.status(400).json({ message: "User already exists." });
    }
    const newUser = new User({
        name,
        email,
        password
    });
    await newUser.save();
    res.status(201).json({ message: "User Registered Successfully" });
});

module.exports = router