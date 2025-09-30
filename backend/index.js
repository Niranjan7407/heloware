require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./db/connectDB');
const passport = require("passport");
const session = require("express-session");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const cors = require("cors");
const User = require("./db/Models/user.js");
const cookieParser = require("cookie-parser");
const auth = require('./routes/auth.js');
const chats = require('./routes/chats.js');
const userRoutes = require('./routes/user.js');

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
      return done(null, user);
    } else {
      // Pass minimal info to frontend for username prompt
      const tempUser = {
        username: "", // Add this line
        name: profile.displayName,
        email: profile.emails[0].value,
        profile: profile.photos[0].value,
        OAuth: {
          googleId: profile.id,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken
        }
      };
      return done(null, tempUser);
    }
  } catch (err) {
    return done(err, null);
  }
}));

// Create server and socket.io instance
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  // You can add chat message handlers here
});

// Routes
app.use('/auth', auth);
app.use('/api/chats', chats);
app.use('/api/user', userRoutes);

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectDB(process.env.DB_URL);
});
