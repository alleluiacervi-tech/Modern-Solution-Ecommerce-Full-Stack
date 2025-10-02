import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { forgotPassword } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        toast.success('Password reset email sent! Check your inbox.');
        navigate('/login');
      } else {
        toast.error(result.message || 'Failed to send reset email.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const handleClose = () => navigate(-1);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-lg overflow-hidden relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          <div className="bg-yellow-400 text-black p-12 flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-6">Forgot Password</h2>
            <p className="text-lg leading-relaxed">
              Enter your email and we’ll send you a link to reset your password.
            </p>
          </div>

          <div className="p-12 flex flex-col justify-center">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-yellow-400 font-bold text-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'SENDING LINK...' : 'SEND RESET LINK'}
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600">Remembered your password? </span>
                <Link
                  to="/login"
                  className="text-sm text-yellow-500 hover:text-yellow-600 font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ForgotPassword;
