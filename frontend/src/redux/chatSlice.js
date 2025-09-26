import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [], // [{ chatId, type, participants, lastMessage, unreadCount }]
  activeChatId: null,
};

const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.list = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },
    updateChat: (state, action) => {
      const updatedChat = action.payload;
      const index = state.list.findIndex(
        (c) => c.chatId === updatedChat.chatId
      );
      if (index >= 0) {
        state.list[index] = { ...state.list[index], ...updatedChat };
      } else {
        state.list.push(updatedChat);
      }
    },
  },
});

export const { setChats, setActiveChat, updateChat } = chatSlice.actions;
export default chatSlice.reducer;
