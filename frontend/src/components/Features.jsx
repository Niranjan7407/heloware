import React from 'react';
import { Zap, Shield, Users, Video, Bell, Smile } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Messages delivered in real-time with zero lag. Experience instant communication.',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'End-to-end encryption keeps your conversations safe and private.',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    icon: Users,
    title: 'Group Chats',
    description: 'Create groups and chat with multiple friends at once effortlessly.',
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Video,
    title: 'Video Calls',
    description: 'Crystal clear video and voice calls to stay connected face-to-face.',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Never miss a message with intelligent notification management.',
    gradient: 'from-red-400 to-rose-500',
  },
  {
    icon: Smile,
    title: 'Rich Media',
    description: 'Share photos, videos, emojis, and more to express yourself fully.',
    gradient: 'from-indigo-400 to-purple-500',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {' '}stay connected
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make your conversations effortless and enjoyable
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Gradient Border on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur`}></div>
                
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                  <Icon className="text-white" size={24} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
