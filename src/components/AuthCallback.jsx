import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use useRef to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const sessionToken = params.get('session_id');
      
      // Check if we have a session_id from OAuth callback
      if (!sessionToken) {
        navigate('/', { replace: true });
        return;
      }

      try {
        // Fetch current user using session token as Bearer
        const response = await axios.get(
          `${API}/auth/me`,
          { 
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${sessionToken}`
            }
          }
        );

        setAuthUser(response.data, response.data.type);
        
        // Clear hash and navigate to dashboard with user data
        window.history.replaceState(null, '', window.location.pathname);
        navigate('/dashboard', { replace: true, state: { user: response.data } });
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/', { replace: true });
      }
    };

    processAuth();
  }, [navigate, setAuthUser]);

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
};
