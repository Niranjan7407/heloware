import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  byChatId: {}, // { chatId: [messages] }
  loading: false,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.byChatId[chatId] = messages;
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.byChatId[chatId]) state.byChatId[chatId] = [];
      state.byChatId[chatId].push(message);
    },
    updateMessageStatus: (state, action) => {
      const { chatId, messageId, status } = action.payload;
      const messages = state.byChatId[chatId];
      if (messages) {
        const msg = messages.find((m) => m.messageId === messageId);
        if (msg) msg.status = status;
      }
    },
  },
});

export const { setMessages, addMessage, updateMessageStatus } =
  messageSlice.actions;
export default messageSlice.reducer;
