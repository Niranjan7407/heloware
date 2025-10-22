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
const BufferedMessage = require("./db/Models/message.js");
const cookieParser = require("cookie-parser");
const auth = require('./routes/auth.js');
const chats = require('./routes/chats.js');
const userRoutes = require('./routes/user.js');
const messageRoutes = require('./routes/messages.js');

// Middleware
app.use(cors({
  origin: "https://heloware.vercel.app/",
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
  callbackURL: "https://heloware-backend.onrender.com/auth/google/callback"
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
    origin: "https://heloware.vercel.app/",
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_chat', async ({ user1Id, user2Id }) => {
    const Chat = require('./db/Models/chat');
    let chat = await Chat.findOne({
      participants: { $all: [user1Id, user2Id], $size: 2 }
    });
    if (!chat) {
      chat = new Chat({ participants: [user1Id, user2Id], messages: [] });
      await chat.save();
    }
    socket.join(chat._id.toString());
    socket.emit('chat_joined', { chatId: chat._id.toString() });

    socket.emit('chat_history', chat.messages);

    // Mark user as online (support multiple sessions per user)
    socket.userId = user1Id;
    if (!io.onlineUsers) io.onlineUsers = {};
    if (!io.onlineUsers[user1Id]) io.onlineUsers[user1Id] = [];
    io.onlineUsers[user1Id].push(socket.id);

    // Deliver buffered messages if any
    try {
      const bufferedMessages = await BufferedMessage.find({ 
        receiver: user1Id, 
        delivered: false 
      }).sort({ timestamp: 1 });
      
      for (const bufferedMsg of bufferedMessages) {
        const messageData = {
          chatId: bufferedMsg.chatId,
          sender: bufferedMsg.sender,
          receiver: bufferedMsg.receiver,
          message: bufferedMsg.message,
          timestamp: bufferedMsg.timestamp
        };
        socket.emit('chat_message', messageData);
        
        // Mark as delivered
        bufferedMsg.delivered = true;
        await bufferedMsg.save();
      }
    } catch (error) {
      console.error('Error delivering buffered messages:', error);
    }
  });

  socket.on('chat_message', async (msg) => {
    const Chat = require('./db/Models/chat');
    const chat = await Chat.findById(msg.chatId);
    chat.messages.push({
      sender: msg.sender,
      content: msg.message,
      timestamp: msg.timestamp,
    });
    await chat.save();

    // Deliver to receiver if online (handle multiple sessions)
    const receiverSocketIds = io.onlineUsers?.[msg.receiver];
    if (receiverSocketIds && receiverSocketIds.length > 0) {
      let delivered = false;
      receiverSocketIds.forEach(socketId => {
        const receiverSocket = io.sockets.sockets.get(socketId);
        if (receiverSocket) {
          receiverSocket.emit('chat_message', msg);
          delivered = true;
        }
      });
      
      if (!delivered) {
        // Clean up invalid socket IDs
        io.onlineUsers[msg.receiver] = io.onlineUsers[msg.receiver].filter(id => 
          io.sockets.sockets.has(id)
        );
        if (io.onlineUsers[msg.receiver].length === 0) {
          delete io.onlineUsers[msg.receiver];
        }
      }
    } else {
      // Buffer message for offline user in MongoDB
      try {
        const bufferedMessage = new BufferedMessage({
          receiver: msg.receiver,
          sender: msg.sender,
          chatId: msg.chatId,
          message: msg.message,
          timestamp: msg.timestamp,
          delivered: false
        });
        await bufferedMessage.save();
      } catch (error) {
        console.error('Error saving buffered message to database:', error);
      }
    }
    // Emit to sender for confirmation
    socket.emit('chat_message', msg);
  });

  socket.on('disconnect', () => {
    if (socket.userId && io.onlineUsers && io.onlineUsers[socket.userId]) {
      // Remove this socket from the user's online sessions
      io.onlineUsers[socket.userId] = io.onlineUsers[socket.userId].filter(
        id => id !== socket.id
      );
      
      // If no more sessions, remove the user entirely
      if (io.onlineUsers[socket.userId].length === 0) {
        delete io.onlineUsers[socket.userId];
      }
    }
  });
});

// Routes
app.use('/auth', auth);
app.use('/api/chats', chats);
app.use('/api/user', userRoutes);
app.use('/api/messages', messageRoutes);

// Cleanup function to remove old delivered messages
const cleanupDeliveredMessages = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    await BufferedMessage.deleteMany({
      delivered: true,
      updatedAt: { $lt: cutoffDate }
    });
    console.log('Cleaned up old delivered messages');
  } catch (error) {
    console.error('Error cleaning up delivered messages:', error);
  }
};

// Run cleanup every 24 hours
setInterval(cleanupDeliveredMessages, 24 * 60 * 60 * 1000);

// Start server
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  connectDB(process.env.DB_URL);
  
  // Run initial cleanup
  setTimeout(cleanupDeliveredMessages, 5000); // Wait 5 seconds after server start
});
