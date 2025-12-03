import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import { API_URL } from '../config.js';

const UsernamePrompt = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const profile = searchParams.get('profile');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/auth/username`,
        { username },
        { withCredentials: true }
      );
      // Hydrate Redux and store token
      if (res.data.user && res.data.token) {
        dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl mb-4">Choose a Username</h2>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 mb-2"
          required
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default UsernamePrompt;
