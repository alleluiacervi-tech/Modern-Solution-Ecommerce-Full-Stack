import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [referenceId, setReferenceId] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Get order details from location state
  const order = location.state?.order;
  const total = location.state?.total;

  useEffect(() => {
    if (!order || !total) {
      navigate('/cart');
    }
  }, [order, total, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/admin/payment/initiate', {
        amount: total,
        phone: phone.trim(),
        orderId: order.id
      });

      if (response.data.success) {
        setReferenceId(response.data.referenceId);
        setPaymentStatus('pending');
        toast.success('Payment request sent! Check your phone for MoMo prompt.');
        
        // Start polling for status
        pollPaymentStatus(response.data.referenceId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (refId) => {
    setCheckingStatus(true);
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await axios.get(`/api/admin/payment/status/${refId}`);
        const status = response.data.status;
        
        if (status === 'SUCCESSFUL') {
          setPaymentStatus('success');
          toast.success('Payment successful!');
          setTimeout(() => {
            navigate('/orders', { state: { paymentSuccess: true } });
          }, 2000);
          return;
        } else if (status === 'FAILED') {
          setPaymentStatus('failed');
          toast.error('Payment failed. Please try again.');
          return;
        } else if (status === 'PENDING' && attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        } else {
          setPaymentStatus('timeout');
          toast.error('Payment timeout. Please try again.');
        }
      } catch (error) {
        console.error('Status check error:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 10000);
        }
      }
    };

    checkStatus();
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
        return <Loader className="h-16 w-16 text-yellow-500 animate-spin" />;
      default:
        return <CreditCard className="h-16 w-16 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment successful! Redirecting...';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'pending':
        return 'Waiting for payment confirmation...';
      default:
        return 'Complete your payment with MTN MoMo';
    }
  };

  if (!order || !total) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment</h1>
          <p className="text-gray-600">{getStatusMessage()}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Order ID:</span>
            <span className="font-medium">#{order.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="text-lg font-bold text-yellow-600">${total}</span>
          </div>
        </div>

        {paymentStatus === null && (
          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="2507XXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your MTN MoMo phone number
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Processing...' : 'Pay with MoMo'}
            </button>
          </form>
        )}

        {paymentStatus === 'pending' && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Check your phone for the MoMo payment prompt and approve the transaction.
            </p>
            {checkingStatus && (
              <p className="text-sm text-gray-500">Checking payment status...</p>
            )}
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="text-center">
            <button
              onClick={() => {
                setPaymentStatus(null);
                setReferenceId(null);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/cart')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
