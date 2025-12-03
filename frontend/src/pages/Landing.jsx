import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import Demo from '../components/Demo.jsx';
import CTA from '../components/CTA.jsx';
import Footer from '../components/Footer.jsx';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <Demo />
      <CTA />
      <Footer />
    </div>
  );
}
