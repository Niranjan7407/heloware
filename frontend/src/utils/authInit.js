import axios from 'axios';
import { API_URL } from '../config.js';

/**
 * Initialize authentication by checking localStorage token
 * and validating it with the backend
 */
export const initializeAuth = async () => {
  try {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      return null;
    }

    // Validate token with backend
    const res = await axios.get(`${API_URL}/auth/me`, {
      withCredentials: true,
    });

    if (res.data.user && res.data.token) {
      return {
        user: res.data.user,
        token: res.data.token,
      };
    }

    return null;
  } catch (error) {
    // Token is invalid or expired
    console.error('Auth initialization failed:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};
