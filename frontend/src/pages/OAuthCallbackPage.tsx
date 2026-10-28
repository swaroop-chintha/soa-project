import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { LogoIcon } from '../components/LogoIcon';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserSession } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // Prevent duplicate execution in React StrictMode
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    if (exchangeAttempted.current) return;
    exchangeAttempted.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setIsProcessing(false);
      if (oauthError === 'access_denied') {
        setError('Google sign-in was cancelled or access was not granted.');
      } else {
        setError(`Google OAuth error: ${oauthError}`);
      }
      return;
    }

    if (!code || !state) {
      setIsProcessing(false);
      setError('Missing authorization code or state parameter from Google OAuth callback.');
      return;
    }

    const processOAuth = async () => {
      try {
        const response = await authService.handleGoogleCallback(code, state);
        setUserSession({
          token: response.token,
          username: response.username,
          role: response.role,
        });
        navigate('/dashboard', { replace: true });
      } catch (err: unknown) {
        setIsProcessing(false);
        setError(getErrorMessage(err));
      }
    };

    processOAuth();
  }, [searchParams, navigate, setUserSession]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between font-sans text-[#111111]">
      {/* Top navigation */}
      <div className="w-full max-w-[90rem] mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#66636D] hover:text-[#111111] transition-colors py-1.5 px-3 rounded-full hover:bg-black/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-[#E5DDF5] shadow-lg p-8 sm:p-10 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F4F0FC] border border-[#E5DDF5] flex items-center justify-center p-2.5 mx-auto shadow-xs">
            <LogoIcon size={32} />
          </div>

          {isProcessing ? (
            <div className="space-y-4">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111111]">
                Authenticating with Google...
              </h1>
              <p className="text-sm text-[#66636D]">
                Exchanging secure authorization credentials with Aegis.
              </p>
              <div className="pt-2 flex justify-center">
                <div className="w-8 h-8 border-3 border-[#30264A]/20 border-t-[#30264A] rounded-full animate-spin" />
              </div>
            </div>
          ) : error ? (
            <div className="space-y-5">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-[#111111]">
                  Authentication Failed
                </h1>
                <p className="mt-2 text-sm text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  {error}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#30264A] hover:bg-[#251D3A] text-white text-sm font-medium shadow-sm transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-[#E5DDF5] bg-white hover:bg-[#F4F0FC]/50 text-[#30264A] text-sm font-medium transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Registering</span>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Footer spacing */}
      <div className="py-4" />
    </div>
  );
};
