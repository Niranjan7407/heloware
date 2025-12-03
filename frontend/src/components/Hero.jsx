import React from 'react';
import { MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-indigo-100">
            <Sparkles className="text-indigo-600" size={16} />
            <span className="text-sm font-medium text-gray-700">
              Real-time messaging, reimagined
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight">
            Connect instantly with
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Heloware
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed">
            Experience seamless real-time conversations with friends and loved ones.
            Fast, secure, and beautifully simple.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Get Started Free</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-400 border-2 border-white"></div>
              </div>
              <span className="font-medium">Trusted by thousands</span>
            </div>
          </div>
        </div>

        {/* Decorative Chat Bubble Animation */}
        <div className="absolute top-1/8 -right-40 hidden lg:block animate-float">
          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100">
            <div className="flex items-center space-x-2">
              <MessageCircle className="text-indigo-600" size={20} />
              <span className="text-sm text-gray-600">Hey there! 👋</span>
            </div>
          </div>
        </div>

        <div className="absolute top-5/8 -left-40 hidden lg:block animate-float animation-delay-2000">
          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100">
            <div className="flex items-center space-x-2">
              <MessageCircle className="text-purple-600" size={20} />
              <span className="text-sm text-gray-600">Let's chat! 💬</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
