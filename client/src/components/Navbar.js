import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import useStore from '../store/useStore';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { user, isAuthenticated, cart, logout, verifyToken } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      {/* Special Offer Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black overflow-hidden h-6">
        <div className="flex items-center h-full">
          <div className="animate-scroll-left whitespace-nowrap">
            <span className="text-white font-bold text-sm mx-8">
              SPECIAL OFFER: 20% OFF ON ALL PRODUCTS - USE CODE: SAVE20
            </span>
            <span className="text-white font-bold text-sm mx-8">
              SPECIAL OFFER: 20% OFF ON ALL PRODUCTS - USE CODE: SAVE20
            </span>
            <span className="text-white font-bold text-sm mx-8">
              SPECIAL OFFER: 20% OFF ON ALL PRODUCTS - USE CODE: SAVE20
            </span>
            <span className="text-white font-bold text-sm mx-8">
              SPECIAL OFFER: 20% OFF ON ALL PRODUCTS - USE CODE: SAVE20
            </span>
          </div>
        </div>
      </div>

      {/* Top Utility Bar */}
      <div className="fixed top-6 left-0 right-0 z-40 bg-yellow-400/80 backdrop-blur supports-[backdrop-filter]:bg-yellow-400/70 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-xs font-bold text-black">
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-2 py-1 rounded-md hover:bg-yellow-300">ENGLISH</button>
            <span className="text-black/40">|</span>
            <button className="px-2 py-1 rounded-md hover:bg-yellow-300">$ DOLLAR (US)</button>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:underline">Blog</Link>
            <Link to="/" className="hover:underline">FAQ</Link>
            <Link to="/" className="hover:underline">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="fixed top-14 left-0 right-0 z-40 bg-yellow-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-4 items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-yellow-400 font-bold text-lg">K</span>
                </div>
                <span className="ml-2 text-xl font-bold text-black">apee</span>
              </Link>
            </div>
            {/* Search */}
            <div className="hidden md:flex col-span-7 items-center">
              <div className="w-full grid grid-cols-12">
                <button className="col-span-3 bg-black/10 text-black font-bold text-sm px-3 rounded-l-lg border border-black/20 hover:bg-black/20">
                  All Categories
                </button>
                <input
                  type="text"
                  placeholder="Search for products, categories, brands, sku..."
                  className="col-span-7 h-10 px-4 border-t border-b border-black/20 focus:outline-none"
                />
                <button className="col-span-2 bg-black text-yellow-400 font-bold rounded-r-lg hover:bg-gray-900">
                  Search
                </button>
              </div>
            </div>

            {/* Desktop Navigation & User Area */}
            <div className="hidden md:flex col-span-4 items-center justify-end space-x-6">
              <Link to="/" className="text-black hover:text-gray-800 text-sm font-bold">Home</Link>
              <Link to="/shop" className="text-black hover:text-gray-800 text-sm font-bold">Shop</Link>
              <ThemeToggle />
              <Link to="/cart" className="relative p-2 text-black hover:text-gray-800 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-yellow-400 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-black hover:text-gray-800 transition-colors"
                  >
                    <User className="h-6 w-6" />
                    <span className="text-sm font-bold">{user?.name}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 font-medium" onClick={() => setDropdownOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 font-medium" onClick={() => setDropdownOpen(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 font-medium" onClick={() => setDropdownOpen(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Order History
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 font-medium" onClick={() => setDropdownOpen(false)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100 font-medium">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-black hover:text-gray-800 px-3 py-2 text-sm font-bold transition-colors">Login</Link>
                  <Link to="/register" className="bg-black text-yellow-400 hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Register</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <Link to="/cart" className="relative p-2 text-black">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-yellow-400 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-black hover:text-gray-800 p-2"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-yellow-400 border-t border-black">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-bold text-black hover:text-gray-800 hover:bg-yellow-300 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="block px-3 py-2 text-base font-bold text-black hover:text-gray-800 hover:bg-yellow-300 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Shop
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-bold text-black hover:text-gray-800 hover:bg-yellow-300 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-base font-bold text-black hover:text-gray-800 hover:bg-yellow-300 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-3 py-2 text-base font-bold text-black hover:text-gray-800 hover:bg-yellow-300 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Order History
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 text-base font-bold text-black hover:text-gray-800 hover:bg-yellow-300 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-bold text-black hover:text-gray-800 hover:bg-yellow-300 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-bold text-black hover:text-gray-800 hover:bg-yellow-300 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-bold text-black hover:text-gray-800 hover:bg-yellow-300 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll-left {
          animation: scroll-left 20s linear infinite;
        }
      `}</style>
    </>
  );
};

export default Navbar;