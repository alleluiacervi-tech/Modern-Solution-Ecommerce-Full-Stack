import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useStore from '../store/useStore';
import { toast } from 'react-toastify';

function ResetPassword() {
  const { token } = useParams(); // get the token from the URL
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await resetPassword(token, newPassword);
      if (result.success) {
        toast.success('Password reset successful! You can now login.');
        navigate('/login');
      } else {
        toast.error(result.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-yellow-400 py-3 rounded font-bold"
        >
          {loading ? 'RESETTING...' : 'RESET PASSWORD'}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;