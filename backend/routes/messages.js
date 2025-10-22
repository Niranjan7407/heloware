const express = require('express');
const router = express.Router();
const BufferedMessage = require('../db/Models/message');
const authMiddleware = require('../Middleware/Auth');

// Get buffered messages for a user (for debugging)
router.get('/buffered/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const bufferedMessages = await BufferedMessage.find({ 
            receiver: userId, 
            delivered: false 
        })
        .populate('sender', 'username name')
        .populate('receiver', 'username name')
        .sort({ timestamp: 1 });
        
        res.json({ 
            success: true, 
            count: bufferedMessages.length,
            messages: bufferedMessages 
        });
    } catch (error) {
        console.error('Error fetching buffered messages:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching buffered messages' 
        });
    }
});

// Clear all buffered messages for a user
router.delete('/buffered/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await BufferedMessage.deleteMany({ 
            receiver: userId, 
            delivered: false 
        });
        
        res.json({ 
            success: true, 
            message: `Cleared ${result.deletedCount} buffered messages` 
        });
    } catch (error) {
        console.error('Error clearing buffered messages:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error clearing buffered messages' 
        });
    }
});

// Get message buffer statistics
router.get('/buffer-stats', authMiddleware, async (req, res) => {
    try {
        const stats = await BufferedMessage.aggregate([
            {
                $group: {
                    _id: '$delivered',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const totalMessages = await BufferedMessage.countDocuments();
        const undeliveredCount = await BufferedMessage.countDocuments({ delivered: false });
        const deliveredCount = await BufferedMessage.countDocuments({ delivered: true });
        
        res.json({
            success: true,
            stats: {
                total: totalMessages,
                undelivered: undeliveredCount,
                delivered: deliveredCount
            }
        });
    } catch (error) {
        console.error('Error fetching buffer stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching buffer statistics' 
        });
    }
});

module.exports = router;