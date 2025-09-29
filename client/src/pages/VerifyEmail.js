import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const VerifyEmail = () => {
  const [verificationState, setVerificationState] = useState({
    code: '',
    loading: false,
    success: false,
    timeLeft: 300, // 5 minutes in seconds
    canResend: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Check if coming from email link
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      verifyTokenFromUrl(token);
    }
  }, [location]);

  // Countdown timer
  useEffect(() => {
    if (verificationState.timeLeft > 0 && !verificationState.success) {
      const timer = setTimeout(() => 
        setVerificationState((prevState) => ({
          ...prevState,
          timeLeft: prevState.timeLeft - 1,
        })), 1000);
      return () => clearTimeout(timer);
    } else if (verificationState.timeLeft === 0) {
      setVerificationState((prevState) => ({
        ...prevState,
        canResend: true,
      }));
      toast.info('You can now resend the verification code.');
    }
  }, [verificationState.timeLeft, verificationState.success]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const verifyTokenFromUrl = async (token) => {
    setVerificationState((prevState) => ({ ...prevState, loading: true }));
    try {
      const response = await axios.get(`/api/auth/verify-email?token=${token}`);
      setVerificationState((prevState) => ({
        ...prevState,
        success: true,
        loading: false,
      }));
      toast.success(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      setVerificationState((prevState) => ({ ...prevState, loading: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (verificationState.code.trim().length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setVerificationState((prevState) => ({ ...prevState, loading: true }));

    try {
      const response = await axios.post('/api/auth/verify-email', { token: verificationState.code });
      setVerificationState((prevState) => ({
        ...prevState,
        success: true,
        loading: false,
      }));
      toast.success(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      setVerificationState((prevState) => ({ ...prevState, loading: false }));
    }
  };

  const resendCode = async () => {
    try {
      const email = localStorage.getItem('pendingVerificationEmail');
      if (!email) {
        toast.error('No email found for resending verification');
        return;
      }

      await axios.post('/api/auth/resend-verification', { email });
      toast.success('Verification code sent!');
      setVerificationState((prevState) => ({
        ...prevState,
        timeLeft: 300,
        canResend: false,
      }));
    } catch (error) {
      toast.error('Error sending verification code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            {verificationState.success ? (
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            {verificationState.success ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {verificationState.success
              ? 'Your email has been successfully verified. Redirecting to login...'
              : 'Enter the 6-digit verification code sent to your email.'}
          </p>
        </div>

        {!verificationState.success && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code
              </label>
              <div className="relative">
                <input
                  id="code"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="000000"
                  value={verificationState.code}
                  onChange={(e) => 
                    setVerificationState((prevState) => ({
                      ...prevState,
                      code: e.target.value.replace(/\D/g, '').slice(0, 6),
                    }))
                  }
                />
                {verificationState.timeLeft > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(verificationState.timeLeft)}
                  </div>
                )}
              </div>
              {verificationState.timeLeft === 0 && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Verification code has expired. Please request a new one.
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={verificationState.loading || verificationState.timeLeft === 0 || verificationState.code.trim().length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {verificationState.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={resendCode}
                disabled={!verificationState.canResend}
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verificationState.canResend ? "Didn't receive the code? Resend" : `Resend available in ${formatTime(verificationState.timeLeft)}`}
              </button>
            </div>
          </form>
        )}

        {verificationState.success && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Redirecting to login page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
