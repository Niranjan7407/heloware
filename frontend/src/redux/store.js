import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import messageReducer from './messageSlice';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer, 
    messages: messageReducer,
    users: userReducer,
  },
});

export default store;
