# MongoDB Message Buffer Implementation

## Overview

This implementation replaces the local in-memory message buffer (`MessageBuffer = {}`) with a MongoDB-based solution for storing and managing offline messages. This provides persistence, scalability, and better reliability for message delivery.

## Key Changes

### 1. New Message Model (`/db/Models/message.js`)

Created a new `BufferedMessage` schema with the following features:
- **Indexes**: Optimized for fast queries by receiver and delivery status
- **Fields**:
  - `receiver`: User who should receive the message
  - `sender`: User who sent the message
  - `chatId`: Reference to the chat
  - `message`: Message content
  - `timestamp`: When the message was sent
  - `delivered`: Boolean flag for delivery status

### 2. Updated Socket.io Logic

#### Connection Handling (`join_chat` event)
- **Before**: Used local `MessageBuffer[userId]` array
- **After**: Queries `BufferedMessage` collection for undelivered messages
- **Benefits**: Persistent across server restarts, supports multiple server instances

#### Message Delivery (`chat_message` event)
- **Before**: Stored messages in local memory array
- **After**: Saves messages to MongoDB with `delivered: false`
- **Benefits**: Guaranteed persistence, better error handling

#### Multi-Session Support
- **Enhancement**: Now supports multiple browser tabs/devices per user
- **Implementation**: `onlineUsers` now stores arrays of socket IDs per user

### 3. New API Endpoints (`/routes/messages.js`)

#### GET `/api/messages/buffered/:userId`
- Retrieve undelivered messages for a user
- Useful for debugging and monitoring

#### DELETE `/api/messages/buffered/:userId`
- Clear all undelivered messages for a user
- Administrative function

#### GET `/api/messages/buffer-stats`
- Get statistics about the message buffer
- Monitor system health

### 4. Automatic Cleanup

- **Scheduled Cleanup**: Removes delivered messages older than 7 days
- **Frequency**: Runs every 24 hours
- **Purpose**: Prevents database growth from old delivered messages

## Benefits of MongoDB Implementation

### 1. Persistence
- Messages survive server restarts
- No data loss during deployments

### 2. Scalability
- Supports multiple server instances
- Horizontal scaling capability

### 3. Reliability
- Database ACID properties
- Error handling and recovery

### 4. Monitoring
- Query capabilities for debugging
- Statistics and analytics

### 5. Multi-Device Support
- Users can have multiple active sessions
- Messages delivered to all connected devices

## Database Optimization

### Indexes Created
```javascript
// Single field indexes
{ receiver: 1 }      // Fast queries by recipient
{ delivered: 1 }     // Fast queries by delivery status

// Compound index
{ receiver: 1, delivered: 1 }  // Optimized for main query pattern
```

### Query Patterns
```javascript
// Find undelivered messages for a user
BufferedMessage.find({ receiver: userId, delivered: false })

// Mark message as delivered
message.delivered = true
message.save()

// Cleanup old delivered messages
BufferedMessage.deleteMany({
  delivered: true,
  updatedAt: { $lt: cutoffDate }
})
```

## Testing

Run the test script to verify functionality:
```bash
node test-message-buffer.js
```

The test script:
1. Creates test users and messages
2. Queries undelivered messages
3. Marks messages as delivered
4. Verifies the delivery status
5. Shows buffer statistics
6. Cleans up test data

## Migration Notes

### From Local Buffer
- **No data migration needed**: Local buffer was ephemeral
- **Immediate benefits**: Messages now persist across restarts

### Deployment Considerations
- Ensure MongoDB connection is stable
- Monitor database size and cleanup frequency
- Consider indexing strategy for large user bases

## Error Handling

### Database Connection Issues
- Graceful fallback to logging errors
- Messages won't be lost if database is temporarily unavailable
- Retry mechanisms can be added if needed

### Socket Connection Issues
- Invalid socket IDs are automatically cleaned up
- Multi-session support handles partial connection failures

## Performance Considerations

### Database Queries
- Indexed queries for optimal performance
- Minimal database calls per message operation

### Memory Usage
- Significantly reduced server memory usage
- No more growing in-memory message arrays

### Network
- Slightly increased database traffic
- Reduced memory pressure on server instances

## Monitoring and Maintenance

### Key Metrics to Monitor
1. Number of undelivered messages
2. Message delivery success rate
3. Database query performance
4. Storage usage growth

### Maintenance Tasks
1. Regular cleanup runs automatically
2. Monitor index usage and optimization
3. Database backup strategies for message data

## Future Enhancements

### Possible Improvements
1. **Message Expiration**: Auto-expire very old undelivered messages
2. **Delivery Receipts**: More sophisticated delivery confirmation
3. **Message Priority**: Prioritize certain message types
4. **Batch Operations**: Optimize bulk message operations
5. **Analytics**: Message delivery statistics and reporting