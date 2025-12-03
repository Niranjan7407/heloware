import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { loginSuccess, logout, rehydrateAuth } from '../redux/authSlice';
import { API_URL } from '../config.js';
import { useNavigate } from 'react-router-dom';

const useAuthCheck = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      // If we already have user and token in Redux (from localStorage), we're good
      if (user && token) {
        return;
      }

      // Try to get auth from backend (cookie-based)
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });
        if (res.data.user && res.data.token) {
          dispatch(
            rehydrateAuth({ user: res.data.user, token: res.data.token })
          );
        }
      } catch (err) {
        // No valid session or token
        dispatch(logout());
        navigate('/');
      }
    };

    checkAuth();
  }, [dispatch, navigate, user, token]);
};

export default useAuthCheck;
