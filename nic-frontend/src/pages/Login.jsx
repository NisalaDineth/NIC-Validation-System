import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>NIC Validation System</h1>
      </div>

      <div className="login-right">
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />

            <label htmlFor="password" className="sr-only">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && <p className="error" role="alert">{error}</p>}

            <button type="submit" className="submit-btn">Login</button>
          </form>

          <p className="switch-auth">
            Forgot your password?{" "}
            <button
              onClick={() => navigate('/forgot-password')}
              type="button"
              className="link-button"
            >
              Reset Here
            </button>
          </p>

          <div className="divider">
            <span>or</span>
          </div>

          <p className="switch-auth">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate('/signup')}
              type="button"
              className="link-button"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
