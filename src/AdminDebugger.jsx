import React from 'react';
import { useAuth } from './AuthContext';

export default function AdminDebugger() {
  const { isAdmin, isLoading, authChecked } = useAuth();
  
  // Only show in development or when admin
  if (!isAdmin && authChecked) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: isAdmin ? '#4CAF50' : '#f44336',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      Admin Status: {isLoading ? 'Loading...' : isAdmin ? 'ACTIVE' : 'INACTIVE'}
      <br />
      Auth Checked: {authChecked ? 'YES' : 'NO'}
      <br />
      LocalStorage: {localStorage.getItem('aau_admin') || 'null'}
    </div>
  );
}
