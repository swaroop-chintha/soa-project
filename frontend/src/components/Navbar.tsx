import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogoIcon } from './LogoIcon';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <NavLink to="/dashboard" className="navbar-brand flex items-center gap-2">
          <LogoIcon size={20} />
          <span>Aegis Claims System</span>
        </NavLink>

        <nav className="navbar-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/policies"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
          >
            Policies
          </NavLink>
          <NavLink
            to="/claims"
            className={({ isActive }) =>
              isActive ? 'navbar-link active' : 'navbar-link'
            }
          >
            Claims
          </NavLink>
        </nav>

        <div className="navbar-user">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
