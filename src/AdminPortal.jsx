import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPortal() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // First check localStorage
      const localAdmin = localStorage.getItem('aau_admin') === 'true';
      const loginTime = localStorage.getItem('aau_admin_login_time');

      if (localAdmin && loginTime) {
        const fourHoursAgo = Date.now() - 14400000;
        if (parseInt(loginTime) > fourHoursAgo) {
          setIsAuthenticated(true);
          navigate('/', { replace: true });
          return;
        }
      }

      // Then check server
      const response = await fetch('https://aau-nightlife-production.up.railway.app/api/admin/verify', {
        credentials: 'include'
      });
      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('aau_admin', 'true');
        localStorage.setItem('aau_admin_login_time', Date.now().toString());
        navigate('/', { replace: true });
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://aau-nightlife-production.up.railway.app/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        // Store admin status in localStorage for immediate UI update
        localStorage.setItem('aau_admin', 'true');
        localStorage.setItem('aau_admin_login_time', Date.now().toString());
        // Force page reload to ensure admin state is recognized
        window.location.href = '/';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('https://aau-nightlife-production.up.railway.app/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('aau_admin');
      setIsAuthenticated(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="admin-portal">
        <div className="admin-portal-container">
          <div className="admin-success-card">
            <div className="success-icon">✅</div>
            <h2>Admin Access Granted</h2>
            <p>You are now logged in as an administrator.</p>
            <div className="admin-actions">
              <button onClick={() => navigate('/')} className="btn-primary">
                Go to Dashboard
              </button>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal">
      <div className="admin-portal-container">
        <div className="admin-login-card">
          <div className="admin-header">
            <div className="admin-logo">🔐</div>
            <h1>Admin Portal</h1>
            <p>AAU Nightlife Administration</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="password">Administrator Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={loading || !password.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Authenticating...
                </>
              ) : (
                'Login to Admin Panel'
              )}
            </button>
          </form>

          <div className="admin-footer">
            <p>Authorized personnel only</p>
            <button 
              onClick={() => navigate('/')} 
              className="back-to-site"
            >
              ← Back to Site
            </button>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        .admin-portal {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f1123 0%, #23244a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        }

        .admin-portal-container {
          width: 100%;
          max-width: 400px;
        }

        .admin-login-card, .admin-success-card {
          background: linear-gradient(135deg, #23244a 0%, #2d2d6e 100%);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(123, 255, 182, 0.1);
          color: #fff;
          text-align: center;
        }

        .admin-header {
          margin-bottom: 2rem;
        }

        .admin-logo {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .admin-header h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #7bffb6;
        }

        .admin-header p {
          color: #d2d6f6;
          margin: 0;
        }

        .admin-login-form {
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #d2d6f6;
        }

        .form-group input {
          width: 100%;
          padding: 1rem;
          border: 2px solid rgba(123, 255, 182, 0.2);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #7bffb6;
          box-shadow: 0 0 0 3px rgba(123, 255, 182, 0.1);
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .login-button {
          width: 100%;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #0074D9 0%, #005fa3 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 52px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 116, 217, 0.4);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: rgba(255, 77, 79, 0.1);
          border: 1px solid rgba(255, 77, 79, 0.3);
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 1rem;
          color: #ff6b6b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .admin-footer {
          border-top: 1px solid rgba(123, 255, 182, 0.1);
          padding-top: 1.5rem;
        }

        .admin-footer p {
          color: #d2d6f6;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .back-to-site {
          background: transparent;
          color: #7bffb6;
          border: 1px solid rgba(123, 255, 182, 0.3);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .back-to-site:hover {
          background: rgba(123, 255, 182, 0.1);
          border-color: #7bffb6;
        }

        /* Success Card Styles */
        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .admin-success-card h2 {
          color: #7bffb6;
          margin-bottom: 1rem;
        }

        .admin-success-card p {
          color: #d2d6f6;
          margin-bottom: 2rem;
        }

        .admin-actions {
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0074D9 0%, #005fa3 100%);
          color: #fff;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 116, 217, 0.4);
        }

        .btn-secondary {
          background: transparent;
          color: #ff6b6b;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
          .admin-portal {
            padding: 0.5rem;
          }

          .admin-login-card, .admin-success-card {
            padding: 2rem 1.5rem;
          }

          .admin-header h1 {
            font-size: 1.5rem;
          }

          .admin-actions {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
