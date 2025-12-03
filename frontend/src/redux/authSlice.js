import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage
const getStoredAuth = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      return {
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error('Error reading auth from localStorage:', error);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const setStoredAuth = (user, token) => {
  try {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
  } catch (error) {
    console.error('Error storing auth in localStorage:', error);
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error clearing auth from localStorage:', error);
  }
};

// Initialize state from localStorage
const storedAuth = getStoredAuth();

const initialState = {
  user: storedAuth.user,
  token: storedAuth.token,
  isAuthenticated: storedAuth.isAuthenticated,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      // Persist to localStorage
      setStoredAuth(action.payload.user, action.payload.token);
    },
    loginFailure: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      clearStoredAuth();
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearStoredAuth();
    },
    rehydrateAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Persist to localStorage
      setStoredAuth(action.payload.user, action.payload.token);
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, rehydrateAuth } =
  authSlice.actions;
export default authSlice.reducer;
