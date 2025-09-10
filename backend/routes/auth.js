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