import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import UsernamePrompt from './pages/UsernamePrompt.jsx';

function App() {
  return (
    <>
      <Routes>
        <Route path="/signup/" element={<Signup />} />
        <Route path="/username" element={<UsernamePrompt />}></Route>
      </Routes>
    </>
  );
}

export default App;
