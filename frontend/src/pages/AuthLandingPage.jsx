import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  AlertCircle,
  ShieldCheck,
  User,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const AuthLandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, register } = useAuth();

  // If already authenticated, redirect straight to fleet
  if (isAuthenticated) {
    return <Navigate to="/fleet" replace />;
  }

  // Toggle between 'login' and 'register'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Controlled Login Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loginErrors, setLoginErrors] = useState({});

  // Controlled Registration Form State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    drivingLicenseNumber: ''
  });
  const [registerErrors, setRegisterErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Login handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (loginErrors[name]) setLoginErrors((prev) => ({ ...prev, [name]: null }));
    setServerError(null);
  };

  const validateLogin = () => {
    const errors = {};
    if (!loginData.email.trim()) {
      errors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!loginData.password) {
      errors.password = 'Please enter your password';
    }
    return errors;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errors = validateLogin();
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setLoading(true);
    setServerError(null);

    const res = await login(loginData.email, loginData.password);
    setLoading(false);

    if (res.success) {
      navigate('/fleet', { replace: true });
    } else {
      setServerError(res.message);
    }
  };

  // Register handlers
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (registerErrors[name]) setRegisterErrors((prev) => ({ ...prev, [name]: null }));
    setServerError(null);
  };

  const validateRegister = () => {
    const errors = {};
    if (!registerData.name.trim()) errors.name = 'Full name is required';
    if (!registerData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!registerData.password) {
      errors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errors = validateRegister();
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    setLoading(true);
    setServerError(null);

    const res = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      phone: registerData.phone,
      drivingLicenseNumber: registerData.drivingLicenseNumber
    });

    setLoading(false);

    if (res.success) {
      navigate('/fleet', { replace: true });
    } else {
      setServerError(res.message);
    }
  };

  // Fast autofill demo credentials
  const fillCredentials = (email, password) => {
    setAuthMode('login');
    setLoginData({ email, password });
    setLoginErrors({});
    setServerError(null);
  };

  return (
    <div className="li-auth-wrapper">
      <div className="li-auth-brand-head">
        <Car size={34} />
        <span>DriveFlow</span>
      </div>

      <div className={`li-auth-card ${authMode === 'register' ? 'li-auth-card-wide' : ''}`}>
        {/* Tab switch between Sign In and Sign Up */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--li-border)', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setServerError(null);
            }}
            className={`li-admin-tab-btn ${authMode === 'login' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center', padding: '0.65rem 0' }}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setServerError(null);
            }}
            className={`li-admin-tab-btn ${authMode === 'register' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center', padding: '0.65rem 0' }}
          >
            Create account
          </button>
        </div>

        {serverError && (
          <div className="li-alert li-alert-danger">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="li-form-group">
              <label className="li-label">Email address</label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                className={`li-input ${loginErrors.email ? 'li-input-error' : ''}`}
                placeholder="name@example.com"
              />
              {loginErrors.email && <span className="li-error-msg">{loginErrors.email}</span>}
            </div>

            <div className="li-form-group">
              <label className="li-label">Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className={`li-input ${loginErrors.password ? 'li-input-error' : ''}`}
                placeholder="••••••••"
              />
              {loginErrors.password && <span className="li-error-msg">{loginErrors.password}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="li-btn li-btn-primary li-btn-block"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* 2. SIGN UP (CREATE ACCOUNT) FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="li-form-group">
              <label className="li-label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                className={`li-input ${registerErrors.name ? 'li-input-error' : ''}`}
                placeholder="e.g. Alex Johnson"
              />
              {registerErrors.name && <span className="li-error-msg">{registerErrors.name}</span>}
            </div>

            <div className="li-form-group">
              <label className="li-label">Email address *</label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                className={`li-input ${registerErrors.email ? 'li-input-error' : ''}`}
                placeholder="alex@example.com"
              />
              {registerErrors.email && <span className="li-error-msg">{registerErrors.email}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="li-form-group">
                <label className="li-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className={`li-input ${registerErrors.password ? 'li-input-error' : ''}`}
                  placeholder="6+ chars"
                />
                {registerErrors.password && (
                  <span className="li-error-msg">{registerErrors.password}</span>
                )}
              </div>

              <div className="li-form-group">
                <label className="li-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  className={`li-input ${registerErrors.confirmPassword ? 'li-input-error' : ''}`}
                  placeholder="Repeat"
                />
                {registerErrors.confirmPassword && (
                  <span className="li-error-msg">{registerErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="li-form-group">
                <label className="li-label">Phone (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  className="li-input"
                  placeholder="+1 555-0199"
                />
              </div>

              <div className="li-form-group">
                <label className="li-label">Driving License No.</label>
                <input
                  type="text"
                  name="drivingLicenseNumber"
                  value={registerData.drivingLicenseNumber}
                  onChange={handleRegisterChange}
                  className="li-input"
                  placeholder="DL-NY-847291"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="li-btn li-btn-primary li-btn-block"
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Creating Account...' : 'Agree & Join DriveFlow'}
            </button>
          </form>
        )}

        {/* Demo Fast-Fill Box */}
        <div className="li-demo-box">
          <span className="li-demo-title">Quick Demo Login</span>
          <div className="li-demo-pills">
            <button
              type="button"
              onClick={() => fillCredentials('admin@carrental.com', 'adminpassword123')}
              className="li-btn li-btn-subtle li-btn-sm"
              style={{ flex: 1 }}
            >
              <ShieldCheck size={14} /> Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('alex@example.com', 'password123')}
              className="li-btn li-btn-subtle li-btn-sm"
              style={{ flex: 1 }}
            >
              <User size={14} /> Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLandingPage;
