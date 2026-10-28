import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';
import { authService } from '../services/authService';
import { Auth2 } from '../components/auth/Auth2';

export const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setError(null);
    setLoading(true);

    try {
      await login(credentials);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const { authorizationUrl } = await authService.getGoogleAuthUrl();
      if (!authorizationUrl) {
        throw new Error('Google authorization URL was not received.');
      }
      window.location.href = authorizationUrl;
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <Auth2
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      error={error}
      loading={loading}
      onClearError={() => setError(null)}
    />
  );
};
