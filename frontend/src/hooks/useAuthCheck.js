import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { loginSuccess, logout } from '../redux/authSlice';

const useAuthCheck = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          'https://heloware-backend.onrender.com/auth/me',
          {
            withCredentials: true,
          }
        );
        if (res.data.user) {
          dispatch(loginSuccess(res.data.user));
        }
      } catch (err) {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch]);
};

export default useAuthCheck;
