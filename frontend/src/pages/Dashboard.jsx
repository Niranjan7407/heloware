import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice';
import ChatList from '../components/ChatList.jsx';
import Chat from '../components/Chat.jsx';
import { setChats, setActiveChat } from '../redux/chatSlice';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeChat, setActiveChatLocal] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      axios
        .get('http://localhost:5000/auth/me', { withCredentials: true })
        .then((res) => {
          if (res.status === 200 && res.data.user) {
            dispatch(loginSuccess(res.data.user));
            navigate('/');
          } else {
            navigate('/login');
          }
        })
        .catch((err) => {
          setError('User fetch failed');
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
    setActiveChatLocal(chat);
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
        .then(() => alert('Friend request sent!'))
        .catch((err) => {
          alert(err.response?.data?.message || 'Failed to send friend request.');
        });
    }
  };

  const handleAcceptFriendRequest = (friendId) => {
    axios
      .post('http://localhost:5000/api/chats/accept-friend', {
        userId: user._id,
        friendId,
      })
      .then(() => {
        alert('Friend request accepted!');
        setFriendRequests((prev) => prev.filter((id) => id !== friendId));
      });
  };

  const handleRejectFriendRequest = (friendId) => {
    axios
      .post('http://localhost:5000/api/chats/reject-friend', {
        userId: user._id,
        friendId,
      })
      .then(() => {
        alert('Friend request rejected!');
        setFriendRequests((prev) => prev.filter((u) => u._id !== friendId));
      });
  };

  const handleAddChat = () => {
    const friendId = prompt('Enter friend user ID to start chat:');
    if (friendId) {
      axios
        .post('http://localhost:5000/api/chats/start-chat', {
          userId: user._id,
          friendId,
        })
        .then((res) => {
          alert('Chat started!');
          dispatch(setChats(res.data.chats));
        });
    }
  };

  if (error) return <div>{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat App Dashboard</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.name}</span>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  dispatch(logout());
                  navigate('/login');
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <main className="flex-grow p-6 bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Your Chats</h2>
        {user ? (
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="md:w-1/3 w-full bg-white p-4 rounded shadow">
              <div className="mb-4">
                <button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded mr-2"
                  onClick={handleAddChat}
                >
                  Add Chat
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2"
                  onClick={handleSendFriendRequest}
                >
                  Send Friend Request
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => {
                    if (friendRequests.length === 0) {
                      alert('No friend requests');
                    } else {
                      handleAcceptFriendRequest(friendRequests[0]);
                    }
                  }}
                >
                  Accept Friend Request
                </button>
              </div>
              {error && <div className="text-red-500 mb-2">{error}</div>}
              {loadingChats ? (
                <div className="flex justify-center items-center h-32">
                  <span className="loader"></span>
                </div>
              ) : (
                <ChatList userId={user._id} onSelectChat={handleSelectChat} />
              )}
              <div className="mt-4">
                <h4>Friend Requests:</h4>
                <ul>
                  {friendRequests.map((user) => (
                    <li key={user._id} className="flex items-center space-x-2">
                      <img
                        src={user.profile}
                        alt={user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{user.name}</span>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => handleAcceptFriendRequest(user._id)}
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleRejectFriendRequest(user._id)}
                      >
                        Reject
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:w-2/3 w-full bg-white p-4 rounded shadow">
              {activeChat ? (
                <Chat
                  userId={user._id}
                  otherUserId={
                    activeChat.participants.find((p) => p._id !== user._id)._id
                  }
                />
              ) : (
                <div>Select a chat to start messaging</div>
              )}
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
