import { useState } from 'react';
import PropTypes from 'prop-types';
import { Send, Smile, Paperclip } from 'lucide-react';

const MessageInput = ({ onSendMessage, chatName, disabled = false }) => {
  const [input, setInput] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-indigo-600 rounded-full transition-colors flex-shrink-0"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          disabled={disabled}
        >
          <Smile size={20} />
        </button>

        <button
          type="button"
          className="p-2 text-gray-500 hover:text-indigo-600 rounded-full transition-colors flex-shrink-0"
          disabled={disabled}
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-gray-500"
            placeholder={
              chatName ? `Message ${chatName}...` : 'Type a message...'
            }
            maxLength={1000}
            disabled={disabled}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            {input.length}/1000
          </div>
        </div>

        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-sm"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  chatName: PropTypes.string,
  disabled: PropTypes.bool,
};

export default MessageInput;
