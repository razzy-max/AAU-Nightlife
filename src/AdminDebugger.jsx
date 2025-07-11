import React from 'react';
import { useAuth } from './AuthContext';

export default function AdminDebugger() {
  const { isAdmin, isLoading, authChecked } = useAuth();

  const loginTime = localStorage.getItem('aau_admin_login_time');
  const timeSinceLogin = loginTime ? Math.floor((Date.now() - parseInt(loginTime)) / 1000 / 60) : 0;

  // Always show for debugging
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: isAdmin ? '#4CAF50' : '#f44336',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '11px',
      zIndex: 9999,
      fontFamily: 'monospace',
      maxWidth: '200px',
      lineHeight: '1.3'
    }}>
      <strong>ADMIN DEBUG</strong>
      <br />
      Status: {isLoading ? 'Loading...' : isAdmin ? 'ACTIVE' : 'INACTIVE'}
      <br />
      Auth Checked: {authChecked ? 'YES' : 'NO'}
      <br />
      LocalStorage: {localStorage.getItem('aau_admin') || 'null'}
      <br />
      Login Time: {loginTime ? `${timeSinceLogin}m ago` : 'none'}
      <br />
      <button
        onClick={() => {
          localStorage.setItem('aau_admin', 'true');
          localStorage.setItem('aau_admin_login_time', Date.now().toString());
          window.location.reload();
        }}
        style={{
          background: '#2196F3',
          color: 'white',
          border: 'none',
          padding: '2px 6px',
          borderRadius: '2px',
          fontSize: '10px',
          cursor: 'pointer',
          marginTop: '4px'
        }}
      >
        Force Admin
      </button>
    </div>
  );
}
