import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const socket = io('http://localhost:5000');

export default function Chat({ userId, otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    // Join the chat when component mounts
    socket.emit('join_chat', { user1Id: userId, user2Id: otherUserId });

    socket.on('chat_joined', ({ chatId }) => {
      setChatId(chatId);
    });

    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat_message');
    };
  }, [userId, otherUserId]);

  const sendMessage = () => {
    if (chatId && input.trim()) {
      socket.emit('chat_message', { chatId, sender: userId, message: input });
      setInput('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender}:</b> {m.message}
          </div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

// Generate prop validation with PropTypes

Chat.propTypes = {
  userId: PropTypes.string.isRequired,
  otherUserId: PropTypes.string.isRequired,
};
