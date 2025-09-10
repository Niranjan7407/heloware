const express = require('express')
const app = express();
const connectDB = require('./db/connectDB')
const { Server } = require('socket.io');
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import cors from "cors";
import User from "./db/Models/user.js";
import cookieParser from "cookie-parser";

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    await User.findOne({ email: profile.emails[0].value }).then(async (currentUser) => {
        if(currentUser){
            done(null, currentUser);
        }else{
            const newUser = await new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                OAuth: {
                    googleId: profile.id,
                    googleAccessToken: accessToken,
                    googleRefreshToken: refreshToken
                },
                profile: profile.photos[0].value
            }).save();
            done(null, newUser);
        }
    });
  }
));

app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

require('dotenv').config();

app.listen(process.env.PORT,()=>{
    console.log(`Server is running in port ${process.env.PORT}`);
    connectDB(process.env.DB_URL)
})


