import axios from 'axios';

/**
 * Setup axios interceptors to include token in requests
 */
export const setupAxiosInterceptors = () => {
  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if not already there
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/' &&
          window.location.pathname !== '/signup'
        ) {
          window.location.href = '/';
        }
      }
      return Promise.reject(error);
    }
  );
};
