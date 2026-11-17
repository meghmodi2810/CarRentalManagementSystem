import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, CalendarCheck, ShieldCheck, LogOut, PlusCircle, User, LogIn } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/fleet');
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
        {/* Left: Brand Logo */}
        <div className="li-header-left">
          <Link to="/fleet" className="li-brand">
            <div className="li-brand-logo-icon">
              <Car size={20} />
            </div>
            <span className="li-brand-text">
              Drive<span className="li-brand-highlight">Flow</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="li-nav">
          <NavLink
            to="/fleet"
            className={({ isActive }) => `li-nav-item ${isActive ? 'active' : ''}`}
          >
            <Car size={18} />
            <span>Fleet</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/add-car"
              className={({ isActive }) => `li-nav-item ${isActive ? 'active' : ''}`}
            >
              <PlusCircle size={18} />
              <span>List Car</span>
            </NavLink>
          )}

          {isAuthenticated && (
            <NavLink
              to="/my-rentals"
              className={({ isActive }) => `li-nav-item ${isActive ? 'active' : ''}`}
            >
              <CalendarCheck size={18} />
              <span>Bookings</span>
            </NavLink>
          )}

          {isAuthenticated && isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `li-nav-item ${isActive ? 'admin-active' : ''}`}
            >
              <ShieldCheck size={18} />
              <span>Admin Hub</span>
            </NavLink>
          )}
        </nav>

        {/* Right: Auth / Profile Area */}
        <div className="li-header-right">
          {isAuthenticated ? (
            <div className="li-user-menu">
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textDecoration: 'none' }}>
                <div className="li-avatar-circle" title={user?.name}>
                  {getInitials(user?.name)}
                </div>
                <div className="li-user-info-text">
                  <span className="li-user-name">{user?.name}</span>
                  <span className="li-user-role-tag">{user?.role}</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="li-logout-btn"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Link to="/login" className="li-btn li-btn-subtle li-btn-sm">
                Sign in
              </Link>
              <Link to="/register" className="li-btn li-btn-primary li-btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
