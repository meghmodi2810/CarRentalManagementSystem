import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    drivingLicenseNumber: ''
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
    if (!formData.name.trim()) errors.name = 'Please enter your full name';
    if (!formData.email.trim()) {
      errors.email = 'Please enter an email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Please enter a password';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be 6 or more characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      drivingLicenseNumber: formData.drivingLicenseNumber
    });

    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="li-auth-wrapper">
      <div className="li-auth-brand-head">
        <Car size={32} />
        <span>DriveFlow</span>
      </div>

      <div className="li-auth-card li-auth-card-wide">
        <h1 className="li-auth-title">Make the most of your travel journey</h1>
        <p className="li-auth-subtitle">Create a DriveFlow account to reserve vehicles instantly</p>

        {serverError && (
          <div className="li-alert li-alert-danger">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="li-form-group">
            <label className="li-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`li-input ${formErrors.name ? 'li-input-error' : ''}`}
              placeholder="e.g. Alex Johnson"
            />
            {formErrors.name && <span className="li-error-msg">{formErrors.name}</span>}
          </div>

          <div className="li-form-group">
            <label className="li-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`li-input ${formErrors.email ? 'li-input-error' : ''}`}
              placeholder="alex@example.com"
            />
            {formErrors.email && <span className="li-error-msg">{formErrors.email}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="li-form-group">
              <label className="li-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`li-input ${formErrors.password ? 'li-input-error' : ''}`}
                placeholder="6+ characters"
              />
              {formErrors.password && <span className="li-error-msg">{formErrors.password}</span>}
            </div>

            <div className="li-form-group">
              <label className="li-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`li-input ${formErrors.confirmPassword ? 'li-input-error' : ''}`}
                placeholder="Repeat password"
              />
              {formErrors.confirmPassword && (
                <span className="li-error-msg">{formErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="li-form-group">
              <label className="li-label">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="li-input"
                placeholder="+1 555-0199"
              />
            </div>

            <div className="li-form-group">
              <label className="li-label">Driver License No. (Optional)</label>
              <input
                type="text"
                name="drivingLicenseNumber"
                value={formData.drivingLicenseNumber}
                onChange={handleInputChange}
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
            {loading ? 'Registering...' : 'Agree & Join'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.825rem', color: 'var(--li-text-secondary)' }}>
          Already on DriveFlow?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
