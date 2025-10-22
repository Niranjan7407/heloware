/**
 * Test script for MongoDB Message Buffer functionality
 * 
 * This script demonstrates how to test the message buffer system:
 * 1. Create test messages in the buffer
 * 2. Query buffered messages
 * 3. Mark messages as delivered
 * 4. Clean up test data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const BufferedMessage = require('./db/Models/message');
const User = require('./db/Models/user');

async function testMessageBuffer() {
    try {
        // Connect to database
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB');

        // Find or create test users
        const testUser1 = await User.findOne({ email: 'test1@example.com' }) || 
            await User.create({
                name: 'Test User 1',
                username: 'testuser1',
                email: 'test1@example.com'
            });

        const testUser2 = await User.findOne({ email: 'test2@example.com' }) || 
            await User.create({
                name: 'Test User 2',
                username: 'testuser2',
                email: 'test2@example.com'
            });

        console.log('Test users ready');

        // Create test buffered messages
        const testMessages = [
            {
                receiver: testUser1._id,
                sender: testUser2._id,
                chatId: new mongoose.Types.ObjectId(),
                message: 'Hello! This is a test message 1',
                delivered: false
            },
            {
                receiver: testUser1._id,
                sender: testUser2._id,
                chatId: new mongoose.Types.ObjectId(),
                message: 'Hello! This is a test message 2',
                delivered: false
            }
        ];

        // Save test messages
        for (const msgData of testMessages) {
            const bufferedMsg = new BufferedMessage(msgData);
            await bufferedMsg.save();
            console.log(`Created buffered message: ${msgData.message}`);
        }

        // Query undelivered messages for testUser1
        const undeliveredMessages = await BufferedMessage.find({
            receiver: testUser1._id,
            delivered: false
        }).populate('sender', 'username name');

        console.log(`Found ${undeliveredMessages.length} undelivered messages for ${testUser1.username}`);

        // Mark messages as delivered
        for (const msg of undeliveredMessages) {
            msg.delivered = true;
            await msg.save();
            console.log(`Marked message as delivered: ${msg.message}`);
        }

        // Verify delivery status
        const stillUndelivered = await BufferedMessage.find({
            receiver: testUser1._id,
            delivered: false
        });

        console.log(`Remaining undelivered messages: ${stillUndelivered.length}`);

        // Get buffer statistics
        const stats = {
            total: await BufferedMessage.countDocuments(),
            delivered: await BufferedMessage.countDocuments({ delivered: true }),
            undelivered: await BufferedMessage.countDocuments({ delivered: false })
        };

        console.log('Buffer Statistics:', stats);

        // Clean up test data
        await BufferedMessage.deleteMany({
            $or: [
                { sender: testUser1._id },
                { sender: testUser2._id },
                { receiver: testUser1._id },
                { receiver: testUser2._id }
            ]
        });

        console.log('Test completed successfully! Cleaned up test data.');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the test
if (require.main === module) {
    testMessageBuffer();
}

module.exports = testMessageBuffer;