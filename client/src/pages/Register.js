import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, X } from 'lucide-react';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register(formData);

    if (result.success) {
      setTimeout(() => {
        navigate('/verify-email');
      }, 2000);
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white shadow-2xl rounded-lg overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left Column - Yellow Section */}
          <div className="bg-yellow-400 text-black p-12 flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-6">Create Account</h2>
            <p className="text-lg leading-relaxed mb-6">
              Join us today and get access to exclusive offers, personalized recommendations, and seamless shopping experience.
            </p>
            <div className="space-y-3 text-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span>Track your orders</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span>Save your wishlist</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span>Get personalized recommendations</span>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="p-12 flex flex-col justify-center">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full px-4 py-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-4 py-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-4 pr-12 text-gray-700 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-4 pr-12 text-gray-700 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Already have account link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <Link to="/login" className="text-sm text-yellow-500 hover:text-yellow-600 font-medium transition-colors">
                  Sign in here
                </Link>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-yellow-400 font-bold text-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>

              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Signup Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center px-4 py-4 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all font-medium"
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC04"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </button>

              {/* Terms and Privacy */}
              <div className="text-center text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-yellow-500 hover:text-yellow-600 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-yellow-500 hover:text-yellow-600 underline">
                  Privacy Policy
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;