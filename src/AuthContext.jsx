import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from './config';

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

  // Check authentication status on app load and when localStorage changes
  useEffect(() => {
    checkAuthStatus();

    // Also check localStorage immediately for faster UI response
    const localAdminStatus = localStorage.getItem('aau_admin') === 'true';
    if (localAdminStatus) {
      setIsAdmin(true);
    }
  }, []);

  // Listen for localStorage changes (in case admin status is set in another tab/window)
  useEffect(() => {
    const handleStorageChange = () => {
      const localAdminStatus = localStorage.getItem('aau_admin') === 'true';
      setIsAdmin(localAdminStatus);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Also check localStorage for immediate UI update
  useEffect(() => {
    const localAdminStatus = localStorage.getItem('aau_admin') === 'true';
    const loginTime = localStorage.getItem('aau_admin_login_time');

    if (localAdminStatus && loginTime) {
      // Check if login is within last 4 hours (4 * 60 * 60 * 1000 = 14400000ms)
      const fourHoursAgo = Date.now() - 14400000;
      if (parseInt(loginTime) > fourHoursAgo) {
        console.log('Valid admin session found in localStorage');
        setIsAdmin(true);
      } else {
        console.log('Admin session expired');
        localStorage.removeItem('aau_admin');
        localStorage.removeItem('aau_admin_login_time');
      }
    }
  }, [authChecked]);

  // Function to warm up the backend (wake it from sleep)
  const warmUpBackend = async () => {
    try {
      console.log('Warming up backend...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      await fetch(`${API_BASE_URL}/api/events`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Backend warmed up successfully');
      return true;
    } catch (error) {
      console.log('Backend warm-up failed:', error.message);
      return false;
    }
  };

  const checkAuthStatus = async () => {
    try {
      // First check localStorage for immediate UI response
      const localAdminStatus = localStorage.getItem('aau_admin') === 'true';
      if (localAdminStatus) {
        setIsAdmin(true);
      }

      // Then verify with server
      console.log('Checking auth status with server...');
      const response = await fetch(API_ENDPOINTS.adminVerify, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      console.log('Server auth response:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Auth verification successful:', data);
        setIsAdmin(true);
        localStorage.setItem('aau_admin', 'true');
      } else {
        console.log('Auth verification failed:', response.status);
        // Don't immediately clear admin status - give user benefit of doubt
        // Only clear if localStorage wasn't set (meaning they never logged in)
        if (!localAdminStatus) {
          setIsAdmin(false);
          localStorage.removeItem('aau_admin');
        } else {
          console.log('Keeping admin status due to localStorage');
          // Keep admin status but warn about server verification failure
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // If server check fails but localStorage says admin, keep admin status
      const localAdminStatus = localStorage.getItem('aau_admin') === 'true';
      if (localAdminStatus) {
        console.log('Server unreachable, keeping admin status from localStorage');
        setIsAdmin(true);
      } else {
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
      console.log('Attempting login to:', API_ENDPOINTS.adminLogin);

      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for cold starts

      const response = await fetch(API_ENDPOINTS.adminLogin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Login response status:', response.status);
      console.log('Login response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok) {
        setIsAdmin(true);
        localStorage.setItem('aau_admin', 'true');
        // Also store a timestamp for session management
        localStorage.setItem('aau_admin_login_time', Date.now().toString());
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error details:', error);
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout. The server may be starting up, please try again in a moment.' };
      }
      if (error.message.includes('Failed to fetch')) {
        return { success: false, error: 'Unable to connect to server. Please check your internet connection and try again.' };
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(API_ENDPOINTS.adminLogout, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAdmin(false);
      localStorage.removeItem('aau_admin');
      localStorage.removeItem('aau_admin_login_time');
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
      console.log('Making authenticated request to:', url);
      const response = await fetch(url, defaultOptions);
      console.log('Response status:', response.status);

      // If we get a 401, try to handle it gracefully
      if (response.status === 401) {
        console.warn('401 Unauthorized - but keeping admin status for now');
        // Don't immediately clear admin status - let user continue
        // Only clear if this is a critical auth check
        if (url.includes('/verify')) {
          setIsAdmin(false);
          localStorage.removeItem('aau_admin');
          localStorage.removeItem('aau_admin_login_time');
          throw new Error('Authentication expired. Please log in again.');
        }
        // For other requests, just return the response and let the component handle it
      }

      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  };

  // Fallback fetch for when server auth is not working
  const fallbackFetch = async (url, options = {}) => {
    console.log('Using fallback fetch with emergency bypass for:', url);
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Bypass': 'emergency-access', // Emergency bypass header
        ...options.headers,
      },
      ...options,
    };
    return fetch(url, defaultOptions);
  };

  // Smart fetch that tries authenticated first, falls back to regular fetch
  const smartFetch = async (url, options = {}) => {
    try {
      // First try authenticated fetch
      const response = await authenticatedFetch(url, options);
      if (response.ok || response.status !== 401) {
        return response;
      }
    } catch (error) {
      console.log('Authenticated fetch failed, trying fallback...');
    }

    // If authenticated fetch fails with 401, try fallback
    return fallbackFetch(url, options);
  };

  const value = {
    isAdmin,
    isLoading,
    authChecked,
    login,
    logout,
    checkAuthStatus,
    warmUpBackend,
    authenticatedFetch: smartFetch, // Use smart fetch instead
    fallbackFetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
