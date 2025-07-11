import React from 'react';
import { useAuth } from './AuthContext';

export default function AdminLogout() {
  const { isAdmin, logout } = useAuth();

  // Only show when user is in admin mode
  if (!isAdmin) return null;

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout from admin mode?')) {
      try {
        // Call logout function from AuthContext
        await logout();
        
        // Clear localStorage
        localStorage.removeItem('aau_admin');
        localStorage.removeItem('aau_admin_login_time');
        
        // Force page reload to ensure admin mode is completely disabled
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
        // Even if server logout fails, clear local state and reload
        localStorage.removeItem('aau_admin');
        localStorage.removeItem('aau_admin_login_time');
        window.location.reload();
      }
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(255, 71, 87, 0.4)',
        transition: 'all 0.3s ease',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 6px 20px rgba(255, 71, 87, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 15px rgba(255, 71, 87, 0.4)';
      }}
      title="Click to logout from admin mode"
    >
      <span style={{ fontSize: '16px' }}>🔓</span>
      Admin Logout
    </button>
  );
}
