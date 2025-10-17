import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChatSpace = ({ messages, userId, chatName, isInitialLoad }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const scrollBehavior = isInitialLoad ? 'instant' : 'smooth';
      setTimeout(() => scrollToBottom(scrollBehavior), 100);
    }
  }, [messages, isInitialLoad]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const date = formatDate(msg.timestamp);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      ref={messagesContainerRef}
      className="overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
      style={{
        scrollBehavior: 'smooth',
        overflowAnchor: 'none',
      }}
    >
      {Object.keys(groupedMessages).length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[200px] text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              No messages yet
            </p>
            <p className="text-sm text-gray-500">
              Start the conversation with {chatName}!
            </p>
          </div>
        </div>
      ) : (
        <div className="px-6 py-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="mb-6">
              {/* Date Separator */}
              <div className="flex items-center justify-center my-6">
                <div className="bg-white shadow-sm border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-full font-medium">
                  {date}
                </div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-4">
                {dateMessages.map((msg, i) => {
                  const isCurrentUser = msg.sender === userId;
                  const showAvatar =
                    i === 0 || dateMessages[i - 1]?.sender !== msg.sender;

                  return (
                    <div
                      key={`${msg._id || i}-${msg.timestamp}`}
                      className={`flex items-end space-x-2 ${
                        isCurrentUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {/* Avatar for other user */}
                      {!isCurrentUser && (
                        <div className="flex-shrink-0 w-8 h-8">
                          {showAvatar ? (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {chatName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ) : (
                            <div className="w-8 h-8"></div>
                          )}
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : ''}`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isCurrentUser
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 border border-gray-200 shadow-sm rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm break-words leading-relaxed">
                            {msg.content || msg.message}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <p
                          className={`text-xs text-gray-500 mt-1 px-1 ${
                            isCurrentUser ? 'text-right' : 'text-left'
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      )}
    </div>
  );
};

ChatSpace.propTypes = {
  messages: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired,
  chatName: PropTypes.string,
  isInitialLoad: PropTypes.bool,
};

ChatSpace.defaultProps = {
  messages: [],
  isInitialLoad: true,
};

export default ChatSpace;