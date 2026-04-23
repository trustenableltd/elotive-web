
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authType, setAuthType] = useState(null); // 'user' or 'guest'

  const checkAuth = useCallback(async () => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
      setAuthType(response.data.type);
    } catch (error) {
      setUser(null);
      setAuthType(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  // Email dialog state
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Google OAuth login
  const loginWithGoogle = () => {
    // Redirect to backend Google OAuth endpoint
    // The backend will handle the OAuth flow and redirect back to home with session_id in hash
    // AppRouter detects the hash and shows AuthCallback component
    const redirectUrl = window.location.origin; // Just go to home page
    window.location.href = `${API}/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Email login/register handler
  const handleEmailAuth = async ({ email, password, name, mode }) => {
    setEmailLoading(true);
    setEmailError("");
    try {
      let endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const payload = mode === 'register' ? { email, password, name } : { email, password };
      const res = await axios.post(`${API}${endpoint}`, payload, { withCredentials: true });
      setAuthUser(res.data.user, res.data.type);
      setShowEmailDialog(false);
      
      // Navigate to dashboard on successful auth
      // Using setTimeout to ensure state updates complete
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch (err) {
      setEmailError(err?.response?.data?.detail || 'Authentication failed');
    } finally {
      setEmailLoading(false);
    }
  };

  // Unified login (for UI buttons)
  const login = (type = 'google') => {
    if (type === 'google') {
      loginWithGoogle();
    } else {
      setShowEmailDialog(true);
    }
  };



  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setAuthType(null);
  };

  const setAuthUser = (userData, type) => {
    setUser(userData);
    setAuthType(type);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authType,
      login,
      logout,
      setAuthUser,
      checkAuth,
      isAuthenticated: !!user,
      showEmailDialog,
      setShowEmailDialog,
      emailLoading,
      emailError,
      handleEmailAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
