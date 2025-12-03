import React from 'react';
import { MessageCircle, Github, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <MessageCircle className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-white">Heloware</span>
            </div>
            <p className="text-sm text-gray-400">
              Real-time messaging that brings people together, instantly and
              effortlessly.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors"
                >
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Heloware. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Status
            </Link>
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Documentation
            </Link>
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              API
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
