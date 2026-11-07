import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, CalendarCheck, ShieldCheck, LogOut, Search } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="li-header">
      <div className="li-header-inner">
        {/* Left: Brand & Search Bar */}
        <div className="li-header-left">
          <Link to={isAuthenticated ? '/fleet' : '/'} className="li-brand">
            <div className="li-brand-logo-icon">
              <Car size={20} />
            </div>
            <span className="li-brand-text">
              Drive<span className="li-brand-highlight">Flow</span>
            </span>
          </Link>

          {isAuthenticated && (
            <div className="li-search-box">
              <Search className="li-search-icon" size={16} />
              <input
                type="text"
                placeholder="Search fleet, brands, branches..."
                className="li-search-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/fleet?search=${encodeURIComponent(e.target.value)}`);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Center: Navigation Links */}
        <nav className="li-nav">
          <NavLink
            to="/fleet"
            className={({ isActive }) => `li-nav-item ${isActive ? 'active' : ''}`}
          >
            <Car size={20} />
            <span>Fleet</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/my-rentals"
              className={({ isActive }) => `li-nav-item ${isActive ? 'active' : ''}`}
            >
              <CalendarCheck size={20} />
              <span>Bookings</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `li-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              <ShieldCheck size={20} />
              <span>Admin Hub</span>
            </NavLink>
          )}
        </nav>

        {/* Right: Auth Profile Area */}
        <div className="li-header-right">
          {isAuthenticated ? (
            <div className="li-user-menu">
              <div className="li-avatar-circle" title={user?.name}>
                {getInitials(user?.name)}
              </div>
              <div className="li-user-info-text">
                <span className="li-user-name">{user?.name}</span>
                <span className="li-user-role-tag">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="li-logout-btn"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/" className="li-btn li-btn-primary li-btn-sm">
                Sign in / Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
