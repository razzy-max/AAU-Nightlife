import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Also check localStorage for immediate UI update
  useEffect(() => {
    const localAdminStatus = localStorage.getItem('aau_admin') === 'true';
    if (localAdminStatus && !authChecked) {
      setIsAdmin(true);
    }
  }, [authChecked]);

  const checkAuthStatus = async () => {
    try {
      // First check localStorage for immediate UI response
      const localAdminStatus = localStorage.getItem('aau_admin') === 'true';
      if (localAdminStatus) {
        setIsAdmin(true);
      }

      // Then verify with server
      const response = await fetch('https://aau-nightlife-production.up.railway.app/api/admin/verify', {
        credentials: 'include'
      });

      if (response.ok) {
        setIsAdmin(true);
        localStorage.setItem('aau_admin', 'true');
      } else {
        setIsAdmin(false);
        localStorage.removeItem('aau_admin');
      }
    } catch (error) {
      // If server check fails but localStorage says admin, keep admin status temporarily
      const localAdminStatus = localStorage.getItem('aau_admin') === 'true';
      if (!localAdminStatus) {
        setIsAdmin(false);
        localStorage.removeItem('aau_admin');
      }
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  };

  const login = async (password) => {
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
        setIsAdmin(true);
        localStorage.setItem('aau_admin', 'true');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('https://aau-nightlife-production.up.railway.app/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAdmin(false);
      localStorage.removeItem('aau_admin');
    }
  };

  // Enhanced fetch function that includes authentication
  const authenticatedFetch = async (url, options = {}) => {
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      // If we get a 401, the token has expired
      if (response.status === 401) {
        setIsAdmin(false);
        localStorage.removeItem('aau_admin');
        throw new Error('Authentication expired. Please log in again.');
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    isAdmin,
    isLoading,
    authChecked,
    login,
    logout,
    checkAuthStatus,
    authenticatedFetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
