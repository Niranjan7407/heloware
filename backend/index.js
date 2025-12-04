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
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const User = require("./db/Models/user.js");
const BufferedMessage = require("./db/Models/message.js");
const cookieParser = require("cookie-parser");
const auth = require('./routes/auth.js');
const chats = require('./routes/chats.js');
const userRoutes = require('./routes/user.js');
const messageRoutes = require('./routes/messages.js');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./Middleware/errorHandler');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Socket.IO
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later.',
});

// Middleware
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
});

app.use(session({
  secret: process.env.SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'none' : 'lax'
  }
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
  callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
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
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }
});

io.on('connection', (socket) => {
  logger.info('Socket connected', { socketId: socket.id });

  // Join notifications room for real-time friend requests
  socket.on('join_notifications', ({ userId }) => {
    try {
      socket.userId = userId;
      socket.join(`user_${userId}`);
      
      // Mark user as online (support multiple sessions per user)
      if (!io.onlineUsers) io.onlineUsers = {};
      if (!io.onlineUsers[userId]) io.onlineUsers[userId] = [];
      io.onlineUsers[userId].push(socket.id);
      
      logger.info('User joined notifications', { userId, socketId: socket.id });
    } catch (error) {
      logger.error('Error in join_notifications', { error: error.message });
    }
  });

  socket.on('join_chat', async ({ user1Id, user2Id }) => {
    try {
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
        logger.error('Error delivering buffered messages', { error: error.message });
      }
      
      logger.info('User joined chat', { userId: user1Id, chatId: chat._id.toString() });
    } catch (error) {
      logger.error('Error in join_chat', { error: error.message });
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  socket.on('chat_message', async (msg) => {
    try {
      const Chat = require('./db/Models/chat');
      const chat = await Chat.findById(msg.chatId);
      if (!chat) {
        logger.error('Chat not found', { chatId: msg.chatId });
        return socket.emit('error', { message: 'Chat not found' });
      }
      
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
          logger.info('Message buffered for offline user', { receiver: msg.receiver });
        } catch (error) {
          logger.error('Error saving buffered message', { error: error.message });
        }
      }
      
      // Emit back to sender ONLY if sender is not in the receiver's socket list
      // This confirms message was sent successfully
      const senderSocketIds = io.onlineUsers?.[msg.sender];
      if (senderSocketIds) {
        senderSocketIds.forEach(socketId => {
          if (socketId !== socket.id) {
            // Only emit to sender's OTHER sessions, not the one that sent it
            const senderSocket = io.sockets.sockets.get(socketId);
            if (senderSocket) {
              senderSocket.emit('chat_message', msg);
            }
          }
        });
      }
    } catch (error) {
      logger.error('Error in chat_message', { error: error.message });
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    try {
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
      logger.info('Socket disconnected', { socketId: socket.id, userId: socket.userId });
    } catch (error) {
      logger.error('Error in disconnect handler', { error: error.message });
    }
  });
});

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Make io available to routes
app.set('io', io);

// Apply rate limiting to auth routes
app.use('/auth', authLimiter, auth);
app.use('/api/chats', generalLimiter, chats);
app.use('/api/user', generalLimiter, userRoutes);
app.use('/api/messages', generalLimiter, messageRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Cleanup function to remove old delivered messages
const cleanupDeliveredMessages = async () => {
  try {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    await BufferedMessage.deleteMany({
      delivered: true,
      updatedAt: { $lt: cutoffDate }
    });
    logger.info('Cleaned up old delivered messages');
  } catch (error) {
    logger.error('Error cleaning up delivered messages:', { error: error.message });
  }
};

// Run cleanup every 24 hours
setInterval(cleanupDeliveredMessages, 24 * 60 * 60 * 1000);

// Start server
server.listen(process.env.PORT, () => {
  logger.info(`Server is running on port ${process.env.PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  connectDB(process.env.DB_URL);
  
  // Run initial cleanup
  setTimeout(cleanupDeliveredMessages, 5000); // Wait 5 seconds after server start
});
