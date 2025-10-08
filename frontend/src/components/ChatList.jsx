// this component should fetch the list of chats for the user and display them
// when a chat is clicked, it should call a prop function to set the active chat in the parent component

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
    // Fetch chats for the user
    axios
      .get(`http://localhost:5000/api/chats/${userId}`)
      .then((res) => {
        dispatch(setChats(res.data.chats));
      })
      .catch((err) => {
        console.error('Error fetching chats', err);
      });
  }, [userId, dispatch]);

  return (
    <div>
      <h3>Your Chats</h3>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat._id}
            className={`p-2 cursor-pointer rounded ${activeChatId === chat._id ? 'bg-indigo-100 font-bold' : ''}`}
            onClick={() => onSelectChat(chat)}
          >
            {chat.participants
              .filter((p) => p._id !== userId)
              .map((p) => p.name)
              .join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

ChatList.propTypes = {
  userId: PropTypes.string.isRequired,
  onSelectChat: PropTypes.func.isRequired,
};

export default ChatList;
