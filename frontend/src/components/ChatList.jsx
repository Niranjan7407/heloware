import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import PropTypes from 'prop-types';
import { setChats } from '../redux/chatSlice';

const ChatList = ({ userId, onSelectChat }) => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat?.chats || []);
  const activeChatId = useSelector((state) => state.chat?.activeChat);

  useEffect(() => {
    axios
      .get(`https://heloware-backend.onrender.com/api/chats/${userId}`)
      .then((res) => {
        dispatch(setChats(res.data.chats));
      })
      .catch((err) => {
        console.error('Error fetching chats', err);
      });
  }, [userId, dispatch]);

  const formatLastMessage = (messages) => {
    if (!messages || messages.length === 0) return 'No messages yet';
    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage.content?.substring(0, 50) +
      (lastMessage.content?.length > 50 ? '...' : '')
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center text-gray-500">
        <div>
          <p>No conversations yet</p>
          <p className="text-sm mt-1">Start by adding friends!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
        <div className="divide-y divide-gray-100">
          {chats.map((chat) => {
            const otherUser = chat.participants.find((p) => p._id !== userId);
            const isActive = activeChatId === chat._id;
            const lastMessage = chat.messages?.[chat.messages.length - 1];

            return (
              <div
                key={chat._id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-2 ${
                  isActive
                    ? 'bg-indigo-50 border-indigo-600'
                    : 'border-transparent hover:border-gray-200'
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        otherUser?.profile ||
                        `https://ui-avatars.com/api/?name=${otherUser?.name}&background=6366f1&color=fff`
                      }
                      alt={otherUser?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`font-medium truncate ${
                          isActive ? 'text-indigo-900' : 'text-gray-900'
                        }`}
                      >
                        {otherUser?.name}
                      </h4>
                      {lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {formatLastMessage(chat.messages)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ChatList.propTypes = {
  userId: PropTypes.string.isRequired,
  onSelectChat: PropTypes.func.isRequired,
};

export default ChatList;
