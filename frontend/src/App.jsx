import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import UsernamePrompt from './pages/UsernamePrompt';
import Dashboard from './pages/Dashboard.jsx';
import ChatPage from './pages/ChatPage.jsx';
import { useSelector } from 'react-redux';
import useAuthCheck from './hooks/useAuthCheck';

function App() {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/username-prompt" element={<UsernamePrompt />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<Dashboard />}></Route>
        <Route path="/chat/:chatId" element={<ChatPage />} />
      </Routes>
    </>
  );
}

export default App;
