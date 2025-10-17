const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true  // Index for faster queries by receiver
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    chatId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Chat', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    delivered: { 
        type: Boolean, 
        default: false,
        index: true  // Index for faster queries by delivery status
    }
}, { 
    timestamps: true 
});

// Compound index for efficient queries
messageSchema.index({ receiver: 1, delivered: 1 });

module.exports = mongoose.model('BufferedMessage', messageSchema);