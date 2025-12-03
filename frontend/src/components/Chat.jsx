import { io } from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import MessageInput from './MessageInput.jsx';
import ChatHeader from './ChatHeader.jsx';
import ChatSpace from './ChatSpace.jsx';
import { API_URL } from '../config.js';

const socket = io(API_URL, {
  autoConnect: true,
});

export default function Chat({ userId, otherUserId, chatName }) {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const chatIdRef = useRef(null);

  // Keep ref in sync with chatId
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  useEffect(() => {
    setIsInitialLoad(true);
    setMessages([]);
    setChatId(null);
  }, [userId, otherUserId]);

  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      setTimeout(() => setIsInitialLoad(false), 200);
    }
  }, [messages, isInitialLoad]);

  useEffect(() => {
    // Define event handlers
    const handleChatJoined = ({ chatId }) => {
      setChatId(chatId);
    };

    const handleChatMessage = (msg) => {
      // Only add message if it belongs to the current chat
      // and prevent duplicates by checking if it already exists
      setMessages((prev) => {
        // Use ref to get current chatId without adding it to dependencies
        const currentChatId = chatIdRef.current;
        
        // Only process if message is for current chat or chatId not yet set
        if (currentChatId && msg.chatId !== currentChatId) {
          return prev; // Ignore messages from other chats
        }
        
        // Check if message already exists (by timestamp, sender, and content)
        const isDuplicate = prev.some(
          (m) =>
            m.timestamp === msg.timestamp &&
            m.sender === msg.sender &&
            m.message === msg.message
        );
        
        if (isDuplicate) {
          return prev; // Don't add duplicate
        }
        
        return [...prev, msg];
      });
    };

    const handleChatHistory = (msgs) => {
      setMessages(msgs);
    };

    // Remove any existing listeners first to prevent duplicates
    socket.off('chat_joined');
    socket.off('chat_message');
    socket.off('chat_history');

    // Add new listeners
    socket.on('chat_joined', handleChatJoined);
    socket.on('chat_message', handleChatMessage);
    socket.on('chat_history', handleChatHistory);

    // Emit join_chat after listeners are set up
    socket.emit('join_chat', { user1Id: userId, user2Id: otherUserId });

    return () => {
      socket.off('chat_joined', handleChatJoined);
      socket.off('chat_message', handleChatMessage);
      socket.off('chat_history', handleChatHistory);
    };
  }, [userId, otherUserId]);

  const handleSendMessage = (message) => {
    if (chatId) {
      const msg = {
        chatId,
        sender: userId,
        receiver: otherUserId,
        message,
        timestamp: new Date().toISOString(),
      };
      
      // Optimistic UI update - add message immediately to sender's view
      setMessages((prev) => [...prev, msg]);
      
      // Send to server
      socket.emit('chat_message', msg);
    }
  };

  const handleVideoCall = () => {
    alert('Video call feature coming soon!');
  };

  const handlePhoneCall = () => {
    alert('Phone call feature coming soon!');
  };

  const handleMoreOptions = () => {
    alert('More options menu coming soon!');
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      <div className="flex-shrink-0">
        <ChatHeader
          chatName={chatName}
          userStatus="Online"
          onVideoCall={handleVideoCall}
          onPhoneCall={handlePhoneCall}
          onMoreOptions={handleMoreOptions}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatSpace
          messages={messages}
          userId={userId}
          chatName={chatName}
          isInitialLoad={isInitialLoad}
        />
      </div>

      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          chatName={chatName}
          disabled={!chatId}
        />
      </div>
    </div>
  );
}

Chat.propTypes = {
  userId: PropTypes.string.isRequired,
  otherUserId: PropTypes.string.isRequired,
  chatName: PropTypes.string,
};
