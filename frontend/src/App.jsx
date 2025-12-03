import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import UsernamePrompt from './pages/UsernamePrompt';
import Dashboard from './pages/Dashboard.jsx';
import ChatPage from './pages/ChatPage.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { rehydrateAuth } from './redux/authSlice';
import { initializeAuth } from './utils/authInit';

function App() {
  const dispatch = useDispatch();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authData = await initializeAuth();
      if (authData) {
        dispatch(rehydrateAuth(authData));
      }
      setAuthInitialized(true);
    };

    checkAuth();
  }, [dispatch]);

  // Show loading spinner while checking auth
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/username-prompt" element={<UsernamePrompt />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/chat/:chatId" element={<ChatPage />} />
      </Routes>
    </>
  );
}

export default App;
