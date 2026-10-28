import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogoIcon } from './LogoIcon';
import { websocketService } from '../services/websocketService';
import { ClaimEvent } from '../types/claim';
import { ErrorBoundary } from './ErrorBoundary';
import {
  Home,
  FileText,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  FolderLock,
  HelpCircle,
  Lock,
  PlusCircle,
  Bell,
  Globe,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'ES' | 'FR'>('EN');

  // Real-time notifications state
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; time: string; read: boolean }>>([
    {
      id: 'notif-1',
      title: 'Aegis Platform notifications initialized',
      time: 'Just now',
      read: false,
    },
  ]);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsubEvent = () => {};

    try {
      websocketService.connect();
      unsubEvent = websocketService.subscribeToAllClaims((event: ClaimEvent) => {
        const newNotif = {
          id: `event-${Date.now()}`,
          title: `Claim #${event.claimId} transitioned to ${event.status}: ${event.message}`,
          time: 'Just now',
          read: false,
        };
        setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);
      });
    } catch (wsErr) {
      console.warn('STOMP live sync unavailable (running in standby):', wsErr);
    }

    return () => {
      try {
        unsubEvent();
      } catch {
        // Ignored
      }
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Claims', path: '/claims', icon: FileText },
    { label: 'Buy Insurance', path: '/buy-insurance', icon: ShoppingBag },
    { label: 'My Policies', path: '/policies', icon: ShieldCheck },
    { label: 'My Profile', path: '/profile', icon: UserIcon },
    { label: 'Documents', path: '/documents', icon: FolderLock },
    { label: 'Help', path: '/help', icon: HelpCircle },
    { label: 'Privacy & Consent', path: '/privacy', icon: Lock },
  ];

  // Helper for current page title
  const getPageTitle = () => {
    if (location.pathname.startsWith('/claims/new')) return 'File a Claim';
    if (location.pathname.startsWith('/claims/')) return 'Claim Details';
    const current = navItems.find((item) =>
      item.path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.path)
    );
    return current ? current.label : 'Customer Portal';
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const userInitials = (user?.username || 'Customer').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F6FA] flex flex-col font-sans text-[#211D2B]">
      {/* App Shell Wrapper */}
      <div className="flex flex-1">
        {/* ==================================================================== */}
        {/* 1. DESKTOP PERSISTENT SIDEBAR */}
        {/* ==================================================================== */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-[#EAE6F2] fixed inset-y-0 left-0 z-30">
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-[#EAE6F2] gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#F0EDFF] border border-[#D4C7F5] flex items-center justify-center transition-transform group-hover:scale-105 p-1.5 text-[#5B4886]">
                <LogoIcon size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-none text-[#30264A]">Aegis</span>
                <span className="text-[10px] text-[#777181] tracking-wider uppercase font-semibold mt-0.5">Insurance OS</span>
              </div>
            </Link>
          </div>

          {/* Quick Action Button: Persistent File a Claim */}
          <div className="p-4 pb-2">
            <Link
              to="/claims/new"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B4886] hover:bg-[#4E3C75] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle size={16} />
              <span>File a Claim</span>
            </Link>
          </div>

          {/* Primary Navigation Menu */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#F0EDFF] text-[#5B4886] font-semibold border border-[#D4C7F5]'
                      : 'text-[#777181] hover:text-[#30264A] hover:bg-[#F7F6FA]'
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? 'text-[#5B4886]' : 'text-[#8E8A98] group-hover:text-[#30264A]'}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* ==================================================================== */}
        {/* 2. MOBILE DRAWER NAVIGATION */}
        {/* ==================================================================== */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-[#30264A]/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col z-50">
              <div className="h-16 flex items-center justify-between px-6 border-b border-[#EAE6F2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F0EDFF] border border-[#D4C7F5] flex items-center justify-center p-1 text-[#5B4886]">
                    <LogoIcon size={18} />
                  </div>
                  <span className="font-bold text-base text-[#30264A]">Aegis Claims</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#777181] hover:text-[#211D2B]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <Link
                  to="/claims/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B4886] text-white text-sm font-semibold"
                >
                  <PlusCircle size={16} />
                  <span>File a Claim</span>
                </Link>
              </div>

              <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/dashboard'
                      ? location.pathname === '/dashboard'
                      : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-[#F0EDFF] text-[#5B4886] font-semibold'
                          : 'text-[#777181] hover:text-[#30264A] hover:bg-[#F7F6FA]'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-[#EAE6F2] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#30264A] text-white flex items-center justify-center text-xs font-bold">
                    {userInitials}
                  </div>
                  <span className="text-xs font-semibold text-[#211D2B]">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. MAIN APPLICATION AREA (Topbar + Page Content) */}
        {/* ==================================================================== */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* TOPBAR */}
          <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#EAE6F2] shadow-xs flex items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Mobile hamburger & Page Breadcrumb Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#777181] hover:bg-[#F7F6FA] cursor-pointer"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2 text-sm font-semibold text-[#30264A]">
                <span className="hidden sm:inline text-[#8E8A98]">Aegis</span>
                <span className="hidden sm:inline text-[#8E8A98]">/</span>
                <span className="text-base sm:text-lg font-bold">{getPageTitle()}</span>
              </div>
            </div>

            {/* Right: Actions, Language, Notifications, User Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Secondary CTA: Quick link to File a Claim on mobile/tablet */}
              <Link
                to="/claims/new"
                className="hidden md:inline-flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4886] text-white text-xs font-semibold shadow-xs"
              >
                <PlusCircle size={14} />
                <span>File Claim</span>
              </Link>

              {/* Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLanguage((prev) => (prev === 'EN' ? 'ES' : prev === 'ES' ? 'FR' : 'EN'))}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#777181] hover:bg-[#F7F6FA] border border-[#EAE6F2] transition-colors cursor-pointer"
                  title="Switch language"
                >
                  <Globe size={14} className="text-[#8E8A98]" />
                  <span>{language}</span>
                </button>
              </div>

              {/* Notifications Bell */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  className="relative p-2 rounded-lg text-[#777181] hover:bg-[#F7F6FA] border border-[#EAE6F2] transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#5B4886] ring-2 ring-white" />
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-[#EAE6F2] shadow-elevated p-4 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE6F2] mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#30264A]">Notifications</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#F0EDFF] text-[#5B4886] text-xs font-semibold">
                          {notifications.length}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                        }
                        className="text-xs text-[#5B4886] hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-[#8E8A98] text-center py-6">No new notifications</p>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-lg bg-[#F7F6FA] hover:bg-[#F0EDFF]/50 border border-[#EAE6F2] transition-colors"
                          >
                            <p className="text-xs font-medium text-[#211D2B] leading-snug">{item.title}</p>
                            <span className="text-[10px] text-[#8E8A98] mt-1 block">{item.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F7F6FA] border border-[#EAE6F2] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#30264A] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {userInitials}
                  </div>
                  <div className="hidden sm:flex flex-col text-left pr-1">
                    <span className="text-xs font-bold text-[#211D2B] leading-tight truncate max-w-[120px]">
                      {user?.username || 'Customer'}
                    </span>
                    <span className="text-[10px] text-[#777181] leading-none">
                      {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Insured Policyholder'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-[#8E8A98] hidden sm:block" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#EAE6F2] shadow-elevated py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#EAE6F2] mb-1">
                      <p className="text-xs font-semibold text-[#211D2B]">{user?.username}</p>
                      <p className="text-[11px] text-[#777181]">{user?.role}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#211D2B] hover:bg-[#F0EDFF] hover:text-[#5B4886] transition-colors"
                    >
                      <UserIcon size={14} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/policies"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#211D2B] hover:bg-[#F0EDFF] hover:text-[#5B4886] transition-colors"
                    >
                      <ShieldCheck size={14} />
                      <span>My Policies</span>
                    </Link>

                    <Link
                      to="/privacy"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#211D2B] hover:bg-[#F0EDFF] hover:text-[#5B4886] transition-colors"
                    >
                      <Lock size={14} />
                      <span>Privacy & Consent</span>
                    </Link>

                    <div className="border-t border-[#EAE6F2] my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* PAGE CONTENT CONTAINER */}
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
};
