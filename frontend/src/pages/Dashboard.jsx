import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice';
import ChatList from '../components/ChatList.jsx';
import Chat from '../components/Chat.jsx';
import { setChats, setActiveChat } from '../redux/chatSlice';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import { MessageSquare, UserPlus, Users, Bell } from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { chats, activeChat } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeChatData, setActiveChatData] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [error, setError] = useState('');
  const [showFriendRequests, setShowFriendRequests] = useState(false);

  useEffect(() => {
    if (!user) {
      axios
        .get('http://localhost:5000/auth/me', { withCredentials: true })
        .then((res) => {
          if (res.status === 200 && res.data.user) {
            dispatch(loginSuccess(res.data.user));
          } else {
            navigate('/login');
          }
        })
        .catch((err) => {
          navigate('/login');
        });
    } else {
      setLoadingChats(true);
      // Fetch chats
      axios
        .get(`http://localhost:5000/api/chats/${user._id}`)
        .then((res) => {
          dispatch(setChats(res.data.chats));
          setLoadingChats(false);
        })
        .catch((err) => {
          setError('Failed to load chats');
          setLoadingChats(false);
        });
      // Fetch friend requests
      axios
        .get(`http://localhost:5000/api/user/${user._id}/friend-requests`)
        .then((res) => setFriendRequests(res.data.friendRequests || []));
    }
  }, [user, dispatch, navigate]);

  const handleSelectChat = (chat) => {
    setActiveChatData(chat);
    dispatch(setActiveChat(chat._id));
  };

  const handleSendFriendRequest = () => {
    const toUsername = prompt('Enter username to send friend request:');
    if (toUsername) {
      axios
        .post('http://localhost:5000/api/chats/friend-request', {
          fromUserId: user._id,
          toUsername,
        })
        .then(() => {
          alert('Friend request sent successfully!');
        })
        .catch((err) => {
          alert(
            err.response?.data?.message || 'Failed to send friend request.'
          );
        });
    }
  };

  const handleAcceptFriendRequest = (friendId) => {
    axios
      .post('http://localhost:5000/api/chats/accept-friend', {
        userId: user._id,
        friendId,
      })
      .then((res) => {
        setFriendRequests((prev) => prev.filter((u) => u._id !== friendId));
        // Refresh chats
        axios
          .get(`http://localhost:5000/api/chats/${user._id}`)
          .then((res) => dispatch(setChats(res.data.chats)));
      });
  };

  const handleRejectFriendRequest = (friendId) => {
    axios
      .post('http://localhost:5000/api/chats/reject-friend', {
        userId: user._id,
        friendId,
      })
      .then(() => {
        setFriendRequests((prev) => prev.filter((u) => u._id !== friendId));
      });
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex">
        <DashboardSidebar
          user={user}
          onLogout={() => {
            dispatch(logout());
            navigate('/login');
          }}
          friendRequestCount={friendRequests.length}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">
                Stay connected with your friends
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFriendRequests(!showFriendRequests)}
                className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {friendRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {friendRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleSendFriendRequest}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <UserPlus size={16} />
                <span>Add Friend</span>
              </button>
            </div>
          </div>
        </header>

        {/* Friend Requests Dropdown */}
        {showFriendRequests && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Friend Requests
            </h3>
            {friendRequests.length === 0 ? (
              <p className="text-gray-500">No pending friend requests</p>
            ) : (
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          request.profile ||
                          `https://ui-avatars.com/api/?name=${request.name}&background=6366f1&color=fff`
                        }
                        alt={request.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{request.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptFriendRequest(request._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectFriendRequest(request._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Chat List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {loadingChats ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <ChatList userId={user._id} onSelectChat={handleSelectChat} />
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 min-h-0 flex flex-col bg-white">
            {activeChatData ? (
              <Chat
                userId={user._id}
                otherUserId={
                  activeChatData.participants.find((p) => p._id !== user._id)
                    ?._id
                }
                chatName={
                  activeChatData.participants.find((p) => p._id !== user._id)
                    ?.name
                }
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageSquare
                    size={64}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a chat from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
