import React from 'react';
import { MessageCircle, Users, Zap, Shield, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-3xl shadow-2xl">
              <MessageCircle
                size={80}
                className="text-white"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Welcome to <span className="text-indigo-600">Heloware</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with friends, share moments, and stay in touch with the
            people who matter most.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="text-indigo-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Fast & Reliable
            </h3>
            <p className="text-sm text-gray-600">
              Real-time messaging with instant delivery
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="text-purple-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Secure & Private
            </h3>
            <p className="text-sm text-gray-600">
              Your conversations are protected and private
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-pink-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Heart className="text-pink-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Stay Connected</h3>
            <p className="text-sm text-gray-600">
              Never miss a moment with your loved ones
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Users size={20} />
            <p className="text-sm">
              Select Messages to start chatting with your friends
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
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
