import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, rehydrateAuth } from '../redux/authSlice';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice';
import ChatList from '../components/ChatList.jsx';
import Chat from '../components/Chat.jsx';
import Home from '../components/Home.jsx';
import { setChats, setActiveChat } from '../redux/chatSlice';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import { MessageSquare, UserPlus, Users, Bell, Check, X } from 'lucide-react';
import { API_URL } from '../config.js';
import { io } from 'socket.io-client';

let socket = null;

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { chats, activeChat } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeChatData, setActiveChatData] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [error, setError] = useState('');
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [activeSection, setActiveSection] = useState('home'); // home, messages, notifications, settings
  const [isAccepting, setIsAccepting] = useState({});
  const [isRejecting, setIsRejecting] = useState({});
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Handle Google OAuth callback with token in URL
  useEffect(() => {
    const authSuccess = searchParams.get('auth');
    if (authSuccess === 'success') {
      // Fetch user data and token from session
      axios
        .get(`${API_URL}/auth/oauth-session`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.status === 200 && res.data.user && res.data.token) {
            dispatch(
              rehydrateAuth({ user: res.data.user, token: res.data.token })
            );
          }
          // Clean up URL
          setSearchParams({});
        })
        .catch((err) => {
          console.error('Error fetching OAuth session:', err);
          setSearchParams({});
        });
    }
  }, [searchParams, setSearchParams, dispatch]);

  useEffect(() => {
    if (!user) {
      axios
        .get(`${API_URL}/auth/me`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.status === 200 && res.data.user && res.data.token) {
            dispatch(
              loginSuccess({ user: res.data.user, token: res.data.token })
            );
          } else {
            navigate('/');
          }
        })
        .catch((err) => {
          navigate('/');
        });
    } else {
      setLoadingChats(true);
      axios
        .get(`${API_URL}/api/chats/${user._id}`)
        .then((res) => {
          dispatch(setChats(res.data.chats));
          setLoadingChats(false);
        })
        .catch((err) => {
          setError('Failed to load chats');
          setLoadingChats(false);
        });
      axios
        .get(`${API_URL}/api/user/${user._id}/friend-requests`)
        .then((res) => setFriendRequests(res.data.friendRequests || []));
    }
  }, [user, dispatch, navigate]);

  // Setup Socket.IO for real-time friend requests
  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    if (!socket) {
      socket = io(API_URL, { autoConnect: true });
    }

    // Join user's personal room for notifications
    socket.emit('join_notifications', { userId: user._id });

    // Listen for incoming friend requests
    socket.on('friend_request_received', (request) => {
      setFriendRequests((prev) => {
        // Avoid duplicates
        if (prev.find((r) => r._id === request._id)) return prev;
        return [...prev, request];
      });
    });

    // Listen for friend request accepted notifications
    socket.on('friend_request_accepted', (data) => {
      // Refresh chats to show new friend
      axios.get(`${API_URL}/api/chats/${user._id}`).then((res) => {
        dispatch(setChats(res.data.chats));
      });
    });

    return () => {
      if (socket) {
        socket.off('friend_request_received');
        socket.off('friend_request_accepted');
      }
    };
  }, [user, dispatch]);

  const handleSelectChat = (chat) => {
    setActiveChatData(chat);
    dispatch(setActiveChat(chat._id));
  };

  const handleSendFriendRequest = () => {
    if (isSendingRequest) return; // Prevent duplicate requests
    
    const toUsername = prompt('Enter username to send friend request:');
    if (toUsername) {
      setIsSendingRequest(true);
      axios
        .post(`${API_URL}/api/chats/friend-request`, {
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
        })
        .finally(() => {
          setIsSendingRequest(false);
        });
    }
  };

  const handleAcceptFriendRequest = (friendId) => {
    if (isAccepting[friendId]) return; // Prevent duplicate requests
    
    setIsAccepting((prev) => ({ ...prev, [friendId]: true }));
    axios
      .post(`${API_URL}/api/chats/accept-friend`, {
        userId: user._id,
        friendId,
      })
      .then((res) => {
        setFriendRequests((prev) => prev.filter((u) => u._id !== friendId));
        axios
          .get(`${API_URL}/api/chats/${user._id}`)
          .then((res) => dispatch(setChats(res.data.chats)));
      })
      .catch((err) => {
        alert(
          err.response?.data?.message || 'Failed to accept friend request.'
        );
      })
      .finally(() => {
        setIsAccepting((prev) => ({ ...prev, [friendId]: false }));
      });
  };

  const handleRejectFriendRequest = (friendId) => {
    if (isRejecting[friendId]) return; // Prevent duplicate requests
    
    setIsRejecting((prev) => ({ ...prev, [friendId]: true }));
    axios
      .post(`${API_URL}/api/chats/reject-friend`, {
        userId: user._id,
        friendId,
      })
      .then(() => {
        setFriendRequests((prev) => prev.filter((u) => u._id !== friendId));
      })
      .catch((err) => {
        alert(
          err.response?.data?.message || 'Failed to reject friend request.'
        );
      })
      .finally(() => {
        setIsRejecting((prev) => ({ ...prev, [friendId]: false }));
      });
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <Home />;

      case 'messages':
        return (
          <>
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
                    onClick={handleSendFriendRequest}
                    disabled={isSendingRequest}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={16} />
                    <span>
                      {isSendingRequest ? 'Sending...' : 'Add Friend'}
                    </span>
                  </button>
                </div>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden min-h-0">
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
                    <ChatList
                      userId={user._id}
                      onSelectChat={handleSelectChat}
                    />
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col bg-white">
                {activeChatData ? (
                  <Chat
                    userId={user._id}
                    otherUserId={
                      activeChatData.participants.find(
                        (p) => p._id !== user._id
                      )?._id
                    }
                    chatName={
                      activeChatData.participants.find(
                        (p) => p._id !== user._id
                      )?.name
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
          </>
        );

      case 'notifications':
        return (
          <>
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Notifications
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage your friend requests
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSendFriendRequest}
                    disabled={isSendingRequest}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={16} />
                    <span>
                      {isSendingRequest ? 'Sending...' : 'Add Friend'}
                    </span>
                  </button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Bell size={20} className="mr-2 text-indigo-600" />
                      Friend Requests
                      {friendRequests.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                          {friendRequests.length}
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="p-6">
                    {friendRequests.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell
                          size={64}
                          className="mx-auto text-gray-300 mb-4"
                        />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No pending friend requests
                        </h3>
                        <p className="text-gray-500 mb-6">
                          When someone sends you a friend request, it will
                          appear here.
                        </p>
                        <button
                          onClick={handleSendFriendRequest}
                          disabled={isSendingRequest}
                          className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserPlus size={18} />
                          <span>
                            {isSendingRequest
                              ? 'Sending...'
                              : 'Add Your First Friend'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {friendRequests.map((request) => (
                          <div
                            key={request._id}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <img
                                  src={
                                    request.profile ||
                                    `https://ui-avatars.com/api/?name=${request.name}&background=6366f1&color=fff`
                                  }
                                  alt={request.name}
                                  className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-lg">
                                  {request.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  @{request.username}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  wants to be your friend
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() =>
                                  handleAcceptFriendRequest(request._id)
                                }
                                disabled={
                                  isAccepting[request._id] ||
                                  isRejecting[request._id]
                                }
                                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Check size={18} />
                                <span>
                                  {isAccepting[request._id]
                                    ? 'Accepting...'
                                    : 'Accept'}
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectFriendRequest(request._id)
                                }
                                disabled={
                                  isAccepting[request._id] ||
                                  isRejecting[request._id]
                                }
                                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <X size={18} />
                                <span>
                                  {isRejecting[request._id]
                                    ? 'Declining...'
                                    : 'Decline'}
                                </span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Settings
              </h3>
              <p className="text-gray-500">
                Coming soon! Customize your experience.
              </p>
            </div>
          </div>
        );

      default:
        return <Home />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <div className="hidden md:flex">
        <DashboardSidebar
          user={user}
          onLogout={async () => {
            try {
              await axios.post(
                `${API_URL}/auth/logout`,
                {},
                { withCredentials: true }
              );
            } catch (err) {
              console.error('Logout error:', err);
            }
            dispatch(logout());
            navigate('/login');
          }}
          friendRequestCount={friendRequests.length}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0">{renderContent()}</div>
    </div>
  );
};

export default Dashboard;
