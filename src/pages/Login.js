import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';  // Import the login API function

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('All fields are required!');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await loginUser({ email, password });
      console.log('Login API response:', response);  // Log the response for inspection

      // Check if the response contains 'access' token and 'refresh' token (indicating successful login)
      if (response.access && response.refresh) {
        // Login is successful, navigate to the dashboard
        navigate('/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during login.');
      console.error('Login Error:', err);  // Log the error
    } finally {
      setIsSubmitting(false);  // Stop the submitting state
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login</h2>
          <p>Welcome back, please login to your account</p>
        </div>

        {error && (
          <div className="alert error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
              <path d="M11 7h2v7h-2zm0 8h2v2h-2z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button onClick={() => navigate('/register')}>Sign Up</button></p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f8fafc;
          padding: 20px;
        }

        .auth-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 420px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-header h2 {
          color: #1e293b;
          font-size: 1.8rem;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .auth-header p {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #334155;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .submit-btn {
          width: 100%;
          background-color: #6366f1;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover {
          background-color: #4f46e5;
        }

        .submit-btn:disabled {
          background-color: #cbd5e1;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          color: #64748b;
          font-size: 0.9rem;
        }

        .auth-footer button {
          background: none;
          border: none;
          color: #6366f1;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .auth-footer button:hover {
          text-decoration: underline;
        }

        .alert {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          gap: 10px;
        }

        .alert svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .alert.error {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .alert.error svg {
          fill: #b91c1c;
        }

        .alert.success {
          background-color: #dcfce7;
          color: #166534;
        }

        .alert.success svg {
          fill: #166534;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
