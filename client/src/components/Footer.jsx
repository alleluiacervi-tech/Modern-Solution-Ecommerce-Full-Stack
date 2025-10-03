import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, Heart, Star, ArrowUp } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(true);

  const handleSubscribe = () => {
    if (email) {
      console.log('Newsletter subscription:', email);
      setEmail('');
      // Add success feedback here
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 hover:scale-110 group"
        >
          <ArrowUp className="h-6 w-6 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}

      <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900/50 to-indigo-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Newsletter Section */}
        <div className="relative border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                Stay in the Loop
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Subscribe to our newsletter and be the first to know about exclusive deals, new arrivals, and special promotions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                />
                <button
                  onClick={handleSubscribe}
                  className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center mb-6 group">
                <div className="relative h-12 w-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-violet-500/50 transition-all duration-300 group-hover:scale-110">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative text-white font-black text-xl z-10">K</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <span className="ml-3 text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  apee
                </span>
              </Link>
              
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Your premium e-commerce destination for quality products at unbeatable prices. 
                Experience shopping redefined with our commitment to excellence, innovation, and customer satisfaction.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center group cursor-pointer">
                  <div className="p-3 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-xl group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-all duration-300">
                    <Mail className="h-5 w-5 text-violet-400" />
                  </div>
                  <span className="ml-4 text-gray-300 group-hover:text-white transition-colors duration-300">
                    support@kapee.com
                  </span>
                </div>
                
                <div className="flex items-center group cursor-pointer">
                  <div className="p-3 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-xl group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-all duration-300">
                    <Phone className="h-5 w-5 text-violet-400" />
                  </div>
                  <span className="ml-4 text-gray-300 group-hover:text-white transition-colors duration-300">
                    +250 796 146 694
                  </span>
                </div>
                
                <div className="flex items-center group cursor-pointer">
                  <div className="p-3 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-xl group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-all duration-300">
                    <MapPin className="h-5 w-5 text-violet-400" />
                  </div>
                  <span className="ml-4 text-gray-300 group-hover:text-white transition-colors duration-300">
                    Kigali, Rwanda
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-violet-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-violet-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-violet-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Cart
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orders"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-violet-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-violet-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Account
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Customer Service */}
            <div>
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    Size Guide
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <span className="text-gray-300 font-medium">Follow Us:</span>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:scale-110 transition-all duration-300 hover:shadow-lg group"
                  >
                    <Facebook className="h-5 w-5 text-white" />
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-gradient-to-r from-sky-500 to-sky-600 rounded-xl hover:scale-110 transition-all duration-300 hover:shadow-lg group"
                  >
                    <Twitter className="h-5 w-5 text-white" />
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl hover:scale-110 transition-all duration-300 hover:shadow-lg group"
                  >
                    <Instagram className="h-5 w-5 text-white" />
                  </a>
                  <a
                    href="#"
                    className="p-3 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl hover:scale-110 transition-all duration-300 hover:shadow-lg group"
                  >
                    <Linkedin className="h-5 w-5 text-white" />
                  </a>
                </div>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-300 text-sm">4.9/5 Rating</span>
                </div>
                <div className="text-gray-300 text-sm">
                  100K+ Happy Customers
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="relative border-t border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center text-gray-400 text-sm">
                <span>© 2024 Kapee. Crafted with</span>
                <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" />
                <span>in Rwanda</span>
              </div>
              
              <div className="flex flex-wrap justify-center space-x-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:underline"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:underline"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:underline"
                >
                  Cookie Policy
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-300 hover:underline"
                >
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;