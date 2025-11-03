import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from './config';

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
      const response = await fetch(API_ENDPOINTS.adminVerify, {
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
      const response = await fetch(API_ENDPOINTS.adminLogin, {
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
      await fetch(API_ENDPOINTS.adminLogout, {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('aau_admin');
      localStorage.removeItem('aau_admin_login_time');
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
          background: var(--gradient-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        }

        .admin-portal-container {
          width: 100%;
          max-width: 480px;
        }

        .admin-login-card, .admin-success-card {
          background: rgba(255,255,255,0.98);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          text-align: center;
        }

        .admin-header {
          margin-bottom: 1.5rem;
        }

        .admin-logo {
          font-size: 2.6rem;
          margin-bottom: 0.75rem;
        }

        .admin-header h1 {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--accent-primary);
        }

        .admin-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .admin-login-form {
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
          text-align: left;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group input {
          width: 100%;
          padding: 0.9rem;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: #fff;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 4px rgba(14,165,255,0.08);
        }

        .form-group input::placeholder {
          color: var(--text-muted);
        }

        .login-button {
          width: 100%;
          padding: 0.9rem 1rem;
          background: var(--gradient-secondary);
          color: var(--text-primary);
          border: none;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 48px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0, 0, 0, 0.08);
          border-top: 2px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: rgba(255, 77, 79, 0.06);
          border: 1px solid rgba(255, 77, 79, 0.12);
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 1rem;
          color: #b00020;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .admin-footer {
          border-top: 1px solid rgba(0,0,0,0.04);
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
