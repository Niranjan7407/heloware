import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  byId: {}, // { userId: {id, name, profile, status} }
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      action.payload.forEach((user) => {
        state.byId[user.id] = user;
      });
    },
    updateUser: (state, action) => {
      const user = action.payload;
      state.byId[user.id] = { ...state.byId[user.id], ...user };
    },
  },
});

export const { setUsers, updateUser } = userSlice.actions;
export default userSlice.reducer;
