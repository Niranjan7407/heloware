import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MessageInput from './MessageInput.jsx';
import ChatHeader from './ChatHeader.jsx';
import ChatSpace from './ChatSpace.jsx';

const socket = io('http://localhost:5000', { autoConnect: true });

export default function Chat({ userId, otherUserId, chatName }) {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Reset initial load state when chat changes
  useEffect(() => {
    setIsInitialLoad(true);
    setMessages([]);
    setChatId(null);
  }, [userId, otherUserId]);

  // Update initial load state when messages arrive
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      setTimeout(() => setIsInitialLoad(false), 200);
    }
  }, [messages, isInitialLoad]);

  useEffect(() => {
    socket.emit('join_chat', { user1Id: userId, user2Id: otherUserId });

    socket.on('chat_joined', ({ chatId }) => {
      setChatId(chatId);
    });

    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('chat_history', (msgs) => {
      setMessages(msgs);
    });

    return () => {
      socket.off('chat_message');
      socket.off('chat_joined');
      socket.off('chat_history');
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
    <div className="h-full min-h-0 flex flex-col">
      <ChatHeader
        chatName={chatName}
        userStatus="Online"
        onVideoCall={handleVideoCall}
        onPhoneCall={handlePhoneCall}
        onMoreOptions={handleMoreOptions}
      />

      {/* Middle section fills remaining height; ChatSpace handles its own scroll */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatSpace
          messages={messages}
          userId={userId}
          chatName={chatName}
          isInitialLoad={isInitialLoad}
        />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        chatName={chatName}
        disabled={!chatId}
      />
    </div>
  );
}

Chat.propTypes = {
  userId: PropTypes.string.isRequired,
  otherUserId: PropTypes.string.isRequired,
  chatName: PropTypes.string,
};