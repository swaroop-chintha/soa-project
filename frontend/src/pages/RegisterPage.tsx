import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { LogoIcon } from '../components/LogoIcon';
import { GoogleIcon } from '../components/auth/GoogleIcon';
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  ArrowLeft,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: fullName.trim() || undefined,
        username: username.trim(),
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { authorizationUrl } = await authService.getGoogleAuthUrl();
      if (!authorizationUrl) {
        throw new Error('Google authorization URL was not received.');
      }
      window.location.href = authorizationUrl;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-between font-sans text-[#111111]">
      {/* Top navigation bar */}
      <div className="w-full max-w-[90rem] mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#66636D] hover:text-[#111111] transition-colors py-1.5 px-3 rounded-full hover:bg-black/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      {/* Main Split Layout */}
      <main className="flex-1 max-w-[90rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#E5DDF5] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* ==================== LEFT PANEL: REGISTRATION FORM ==================== */}
          <div className="lg:col-span-7 p-8 sm:p-12 md:p-14 flex flex-col justify-center bg-white">
            <div className="w-full max-w-md mx-auto space-y-6">
              
              {/* Brand & Heading */}
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#F4F0FC] border border-[#E5DDF5] flex items-center justify-center p-1.5 shadow-xs">
                    <LogoIcon size={22} />
                  </div>
                  <span className="font-semibold text-2xl tracking-tight text-[#30264A]">
                    Aegis
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
                  Create an account.
                </h1>
                <p className="mt-1.5 text-sm text-[#66636D]">
                  Get started with seamless claims filing and tracking.
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
                    <p className="font-medium">Registration Failed</p>
                    <p className="mt-0.5 text-rose-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Google OAuth Button */}
              <div>
                <button
                  type="button"
                  id="google-register-btn"
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
                  OR REGISTER WITH EMAIL
                </span>
                <div className="border-t border-[#E5DDF5] w-full" />
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#66636D]"
                  >
                    Full Name <span className="text-[#66636D]/60 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66636D]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={loading || googleLoading}
                      placeholder="e.g. Jane Doe"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5DDF5] bg-[#F4F0FC]/30 text-sm text-[#111111] placeholder:text-[#66636D]/45 focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:border-[#30264A] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label
                    htmlFor="username"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#66636D]"
                  >
                    Username <span className="text-rose-500">*</span>
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
                        if (error) setError(null);
                      }}
                      disabled={loading || googleLoading}
                      placeholder="e.g. janedoe"
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5DDF5] bg-[#F4F0FC]/30 text-sm text-[#111111] placeholder:text-[#66636D]/45 focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:border-[#30264A] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#66636D]"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66636D]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={loading || googleLoading}
                      placeholder="e.g. jane.doe@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5DDF5] bg-[#F4F0FC]/30 text-sm text-[#111111] placeholder:text-[#66636D]/45 focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:border-[#30264A] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#66636D]"
                  >
                    Password <span className="text-rose-500">*</span>
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
                        if (error) setError(null);
                      }}
                      disabled={loading || googleLoading}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#E5DDF5] bg-[#F4F0FC]/30 text-sm text-[#111111] placeholder:text-[#66636D]/45 focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:border-[#30264A] focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#66636D] hover:text-[#111111] focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#66636D]"
                  >
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#66636D]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={loading || googleLoading}
                      placeholder="Re-enter your password"
                      required
                      className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#E5DDF5] bg-[#F4F0FC]/30 text-sm text-[#111111] placeholder:text-[#66636D]/45 focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:border-[#30264A] focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#66636D] hover:text-[#111111] focus:outline-none"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={loading || googleLoading}
                  className="w-full mt-3 group relative flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#30264A] hover:bg-[#251D3A] text-white text-sm font-medium shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </>
                  )}
                </button>

                {/* Sign in link */}
                <div className="text-center pt-3 pb-1 text-xs sm:text-sm text-[#66636D]">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    id="signin-link"
                    className="font-medium text-[#5B4886] hover:text-[#30264A] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[#C9B9F2] focus:ring-offset-2 rounded transition-colors ml-1"
                  >
                    Sign in
                  </Link>
                </div>

              </form>
            </div>
          </div>

          {/* ==================== RIGHT PANEL: MINIMAL BRAND SHOWCASE ==================== */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#30264A] via-[#281F3E] to-[#1E1730] text-white p-12 lg:p-14 flex-col justify-center items-center text-center relative overflow-hidden">
            
            {/* Subtle Ambient Lighting */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#C9B9F2]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#30264A]/50 blur-3xl pointer-events-none" />

            {/* Clean, Intentional Brand Showcase */}
            <div className="relative z-10 max-w-sm space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center p-2.5 mx-auto shadow-sm backdrop-blur-sm">
                <LogoIcon size={38} />
              </div>

              <div className="text-xs font-semibold tracking-[0.3em] text-[#C9B9F2] uppercase">
                Aegis
              </div>

              <div className="space-y-3 pt-2">
                <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white leading-snug">
                  Start your journey.
                </h2>
                <p className="text-sm sm:text-base text-white/75 font-light leading-relaxed">
                  Fast, transparent insurance coverage and claim processing.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Subtle bottom padding */}
      <div className="py-4" />
    </div>
  );
};
