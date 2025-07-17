import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Reset token is missing or invalid.');
    }
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      return setError('Please fill in all fields');
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || 'Reset failed');

      setSuccess('✅ Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-left">
        <h1>NIC Validation System</h1>
      </div>

      <div className="reset-right">
        <div className="reset-container">
          <h2>Reset Your Password</h2>
          <form onSubmit={handleReset} autoComplete="off" noValidate>
            <label htmlFor="newPassword" className="sr-only">New Password</label>
            <input
              type="password"
              id="newPassword"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && <p className="error" role="alert">{error}</p>}
            {success && <p className="success" role="status">{success}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="switch-auth">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="link-button"
            >
              ← Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
