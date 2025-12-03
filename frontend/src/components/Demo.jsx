import React, { useState } from 'react';
import { MessageCircle, Send, Check, CheckCheck } from 'lucide-react';

export default function Demo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! Have you tried Heloware yet?",
      sender: 'other',
      time: '10:30 AM',
      status: 'read',
    },
    {
      id: 2,
      text: "Yes! It's amazing! The interface is so clean 🎉",
      sender: 'me',
      time: '10:31 AM',
      status: 'read',
    },
    {
      id: 3,
      text: "Right? And messages are super fast!",
      sender: 'other',
      time: '10:31 AM',
      status: 'read',
    },
  ]);

  const [inputValue, setInputValue] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'me',
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'sent',
      };
      setMessages([...messages, newMessage]);
      setInputValue('');

      // Simulate read status after 1 second
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          )
        );
      }, 1000);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            See it in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {' '}action
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the smooth, intuitive interface that makes chatting a breeze
          </p>
        </div>

        {/* Demo Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Demo Chat</h3>
                <p className="text-white/80 text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Online
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === 'me'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div
                      className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                        message.sender === 'me' ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      <span>{message.time}</span>
                      {message.sender === 'me' && (
                        <>
                          {message.status === 'sent' && <Check size={14} />}
                          {message.status === 'read' && <CheckCheck size={14} />}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSend} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputValue.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* Try It Badge */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              ✨ Try typing a message in the demo above!
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}
