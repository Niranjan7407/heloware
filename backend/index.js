require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./db/connectDB');
const passport = require("passport");
const session = require("express-session");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const cors = require("cors");
const User = require("./db/Models/user.js");
const cookieParser = require("cookie-parser");
const auth = require('./routes/auth.js');

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport config
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
     if (user) {
      // ✅ Existing user → login immediately
      return done(null, user);
    }
    else {
      console.log(profile)
      tempUser = {
        name: profile.displayName,
        email: profile.emails[0].value,
        OAuth: {
          googleId: profile.id,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken
        },
        profile: profile.photos[0].value
      };
      return done(null, tempUser);
    }
    
  } catch (err) {
    return done(err, null);
  }
}));

// Routes
app.use('/auth', auth);

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectDB(process.env.DB_URL);
});
