const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {    
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    default: null
  },
  OAuth:{
    googleId: String,
    googleAccessToken: String,
    googleRefreshToken: String
  },
  profile:String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);


