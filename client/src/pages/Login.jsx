import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useStore();
  const navigate = useNavigate();

  // Check for Google OAuth success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const success = urlParams.get('success');
    
    if (token && success) {
      localStorage.setItem('token', token);
      toast.success('Successfully logged in with Google!');
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData);

      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google`;
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-lg overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          {/* Left Column */}
          <div className="bg-yellow-400 text-black p-12 flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-6">Login</h2>
            <p className="text-lg leading-relaxed">
              Access your Orders, Wishlist, and Recommendations.
            </p>
          </div>

          {/* Right Column - Form */}
          <div className="p-12 flex flex-col justify-center">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-6">
                <input
                  type="email"
                  required
                  className="w-full px-4 py-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-4 pr-12 text-gray-700 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                    placeholder="Enter Password"
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                  />
                  <span className="ml-2 text-sm text-yellow-500 font-medium">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-yellow-500 hover:text-yellow-600 font-medium transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-yellow-400 font-bold text-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'SIGNING IN...' : 'LOG IN'}
              </button>

              {/* Google Login */}
              <div className="mt-6 relative text-center text-sm text-gray-500">
                <span className="bg-white px-2">Or continue with</span>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex justify-center items-center mt-2 px-4 py-3 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all font-medium rounded"
                >
                  {/* Google Icon */}
                  <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
