import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from '../LogoIcon';
import { GoogleIcon } from './GoogleIcon';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export interface Auth2Props {
  onLogin: (credentials: { username: string; password: string }) => Promise<void>;
  onGoogleLogin?: () => Promise<void>;
  error?: string | null;
  loading?: boolean;
  onClearError?: () => void;
}

export const Auth2: React.FC<Auth2Props> = ({
  onLogin,
  onGoogleLogin,
  error: externalError,
  loading: externalLoading = false,
  onClearError,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const error = externalError || localError;
  const loading = externalLoading || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLocalError('Please enter both username and password.');
      return;
    }

    setLocalError(null);
    if (onClearError) onClearError();
    setIsSubmitting(true);

    try {
      await onLogin({ username: username.trim(), password });
    } catch {
      // error handled by parent login handler
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    if (!onGoogleLogin) return;
    setLocalError(null);
    if (onClearError) onClearError();
    setGoogleLoading(true);
    try {
      await onGoogleLogin();
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to initialize Google authentication.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between font-sans text-[#111111]">
      {/* Top navigation bar */}
      <div className="w-full max-w-[90rem] mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#66636D] hover:text-[#111111] transition-colors py-1.5 px-3 rounded-full hover:bg-black/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      {/* Main Split Layout */}
      <main className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6 flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#E5DDF5] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* ==================== LEFT PANEL: REFINED LOGIN FORM ==================== */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
            <div className="w-full max-w-md mx-auto space-y-5">
              
              {/* Brand & Heading */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F0FC] border border-[#E5DDF5] flex items-center justify-center p-1.5 shadow-xs">
                    <LogoIcon size={22} />
                  </div>
                  <span className="font-semibold text-2xl tracking-tight text-[#30264A]">
                    Aegis
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
                  Welcome back.
                </h1>
                <p className="mt-1 text-sm text-[#66636D]">
                  Sign in to manage your policies and insurance claims.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Authentication Failed</p>
                    <p className="mt-0.5 text-rose-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Google OAuth Button */}
              <div>
                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleClick}
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-[#E5DDF5] bg-white text-[#111111] text-sm font-medium hover:bg-[#F4F0FC]/50 hover:border-[#D4C5EF] focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:border-[#30264A] transition shadow-xs disabled:opacity-60 disabled:pointer-events-none active:scale-[0.99]"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-[#30264A]/30 border-t-[#30264A] rounded-full animate-spin" />
                  ) : (
                    <>
                      <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Subtle Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E5DDF5] w-full" />
                <span className="bg-white px-3 text-[10px] sm:text-xs font-semibold tracking-wider text-[#66636D] uppercase relative whitespace-nowrap">
                  OR CONTINUE WITH EMAIL
                </span>
                <div className="border-t border-[#E5DDF5] w-full" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Username Input */}
                <div className="space-y-1">
                  <label
                    htmlFor="username"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#66636D]"
                  >
                    Username or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66636D]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (localError) setLocalError(null);
                        if (onClearError) onClearError();
                      }}
                      disabled={loading || googleLoading}
                      placeholder="e.g. admin or user"
                      autoFocus
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5DDF5] bg-[#F4F0FC]/30 text-sm text-[#111111] placeholder:text-[#66636D]/45 focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:border-[#30264A] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#66636D]"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66636D]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (localError) setLocalError(null);
                        if (onClearError) onClearError();
                      }}
                      disabled={loading || googleLoading}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#E5DDF5] bg-[#F4F0FC]/30 text-sm text-[#111111] placeholder:text-[#66636D]/45 focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:border-[#30264A] focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#66636D] hover:text-[#111111] focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#66636D]">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E5DDF5] text-[#30264A] focus:ring-[#C9B9F2] focus:ring-offset-0"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Sign-in Button */}
                <button
                  type="submit"
                  id="signin-btn"
                  disabled={loading || googleLoading}
                  className="w-full mt-2 group relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#30264A] hover:bg-[#251D3A] text-white text-sm font-medium shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </>
                  )}
                </button>

                {/* Sign up link immediately below Sign In */}
                <div className="text-center pt-3 pb-1 text-xs sm:text-sm text-[#66636D]">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    id="signup-link"
                    className="font-medium text-[#5B4886] hover:text-[#30264A] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:ring-offset-2 rounded transition-colors ml-1"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* ==================== RIGHT PANEL: MINIMAL BRAND SHOWCASE ==================== */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#30264A] via-[#281F3E] to-[#1E1730] text-white p-10 lg:p-12 flex-col justify-center items-center text-center relative overflow-hidden">
            
            {/* Subtle Ambient Lighting */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#C9B9F2]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#30264A]/50 blur-3xl pointer-events-none" />

            {/* Clean, Intentional Brand Showcase */}
            <div className="relative z-10 max-w-sm space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center p-2.5 mx-auto shadow-sm backdrop-blur-sm">
                <LogoIcon size={38} />
              </div>

              <div className="text-xs font-semibold tracking-[0.3em] text-[#C9B9F2] uppercase">
                Aegis
              </div>

              <div className="space-y-2.5 pt-1">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white leading-snug">
                  Confidence in every claim.
                </h2>
                <p className="text-sm sm:text-base text-white/75 font-light leading-relaxed">
                  Insurance claims, made simpler.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Subtle bottom padding */}
      <div className="py-3" />
    </div>
  );
};
