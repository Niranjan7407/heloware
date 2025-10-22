import React from 'react';
import PropTypes from 'prop-types';
import { Phone, Video, MoreVertical } from 'lucide-react';

const ChatHeader = ({
  chatName,
  userStatus = 'Online',
  onVideoCall,
  onPhoneCall,
  onMoreOptions,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium">
            {chatName?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{chatName}</h3>
          <p
            className={`text-sm ${userStatus === 'Online' ? 'text-green-600' : 'text-gray-500'}`}
          >
            {userStatus}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onPhoneCall}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          aria-label="Voice call"
        >
          <Phone size={20} />
        </button>
        <button
          onClick={onVideoCall}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          aria-label="Video call"
        >
          <Video size={20} />
        </button>
        <button
          onClick={onMoreOptions}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

ChatHeader.propTypes = {
  chatName: PropTypes.string,
  userStatus: PropTypes.string,
  onVideoCall: PropTypes.func,
  onPhoneCall: PropTypes.func,
  onMoreOptions: PropTypes.func,
};

// Default props for the functions to prevent errors when not provided
ChatHeader.defaultProps = {
  onVideoCall: () => {},
  onPhoneCall: () => {},
  onMoreOptions: () => {},
  userStatus: 'Online',
};

export default ChatHeader;
