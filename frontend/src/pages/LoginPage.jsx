import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, AlertCircle, ShieldCheck, User, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError(null);
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Please enter an email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Please enter a password';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setServerError(null);

    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.message);
    }
  };

  const fillCredentials = (email, password) => {
    setFormData({ email, password });
    setFormErrors({});
    setServerError(null);
  };

  return (
    <div className="li-auth-wrapper">
      <div className="li-auth-brand-head">
        <Car size={32} />
        <span>DriveFlow</span>
      </div>

      <div className="li-auth-card">
        <h1 className="li-auth-title">Sign in</h1>
        <p className="li-auth-subtitle">Stay connected with your reservations and fleet</p>

        {serverError && (
          <div className="li-alert li-alert-danger">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="li-form-group">
            <label className="li-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`li-input ${formErrors.email ? 'li-input-error' : ''}`}
              placeholder="name@example.com"
            />
            {formErrors.email && <span className="li-error-msg">{formErrors.email}</span>}
          </div>

          <div className="li-form-group">
            <label className="li-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`li-input ${formErrors.password ? 'li-input-error' : ''}`}
              placeholder="••••••••"
            />
            {formErrors.password && <span className="li-error-msg">{formErrors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="li-btn li-btn-primary li-btn-block"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo Fast Fill Pills */}
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

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.825rem', color: 'var(--li-text-secondary)' }}>
          New to DriveFlow?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Join now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
