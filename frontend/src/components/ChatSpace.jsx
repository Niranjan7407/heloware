import React, { useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const ChatSpace = ({ messages, userId, chatName, isInitialLoad }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldScrollRef = useRef(true);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Handle scroll to detect if user is at bottom
  const handleScroll = useCallback((e) => {
    if (e.target) {
      const { scrollHeight, scrollTop, clientHeight } = e.target;
      // If user is within 50px of bottom, consider them at bottom
      shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
    }
  }, []);

  // Auto-scroll to bottom only on initial load or when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      if (isInitialLoad) {
        // Initial load: scroll to bottom instantly
        setTimeout(() => scrollToBottom('instant'), 100);
        shouldScrollRef.current = true;
      } else if (shouldScrollRef.current) {
        // User was at bottom, keep them there as new messages arrive
        setTimeout(() => scrollToBottom('smooth'), 100);
      }
    }
  }, [messages, isInitialLoad, scrollToBottom]);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
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
  // Sort dates in chronological order (oldest to newest)
  const sortedDates = Object.keys(groupedMessages).sort((a, b) => {
    const dateA = groupMessagesByDate(
      messages.filter((m) => formatDate(m.timestamp) === a)
    )[a]?.[0]?.timestamp;
    const dateB = groupMessagesByDate(
      messages.filter((m) => formatDate(m.timestamp) === b)
    )[b]?.[0]?.timestamp;
    return new Date(dateA) - new Date(dateB);
  });

  return (
    <div ref={messagesContainerRef} className="h-full bg-gray-50 flex flex-col">
      {/* This is the only scrollable area and its height is fixed by the parent */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 flex flex-col"
        style={{ scrollBehavior: 'smooth', overflowAnchor: 'none' }}
        onScroll={handleScroll}
      >
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px] text-gray-500">
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
          <div className="flex flex-col">
            {sortedDates.map((date) => (
              <div key={date} className="mb-6">
                <div className="flex items-center justify-center my-6">
                  <div className="bg-white shadow-sm border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-full font-medium">
                    {date}
                  </div>
                </div>

                <div className="space-y-4">
                  {groupedMessages[date].map((msg, i) => {
                    const isCurrentUser = msg.sender === userId;
                    const showAvatar =
                      i === 0 ||
                      groupedMessages[date][i - 1]?.sender !== msg.sender;

                    return (
                      <div
                        key={`${msg._id || i}-${msg.timestamp}`}
                        className={`flex items-end space-x-2 ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {!isCurrentUser && (
                          <div className="flex-shrink-0 w-8 h-8">
                            {showAvatar ? (
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {chatName?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            ) : (
                              <div className="w-8 h-8" />
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-xs lg:max-w-md ${
                            isCurrentUser ? 'order-2' : ''
                          }`}
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

            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>
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
