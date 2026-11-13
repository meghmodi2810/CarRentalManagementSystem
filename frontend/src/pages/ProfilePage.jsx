import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Mail, Phone, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    drivingLicenseNumber: user?.drivingLicenseNumber || ''
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setNotice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const res = await api.put('/users/profile', formData);
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setNotice({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setNotice({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setLoading(false);
    }
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
    <div className="linkedin-container" style={{ maxWidth: '640px' }}>
      <Link to="/fleet" className="li-back-btn">
        <ArrowLeft size={16} /> Back to fleet
      </Link>

      <div className="li-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--li-border)' }}>
          <div className="li-avatar-lg">
            {getInitials(user?.name)}
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--li-text-primary)' }}>
              {user?.name}
            </h1>
            <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.85rem' }}>
              {user?.email} • <span className={`li-badge li-badge-${user?.role === 'admin' ? 'rented' : 'available'}`}>{user?.role}</span>
            </p>
          </div>
        </div>

        {notice && (
          <div className={`li-alert li-alert-${notice.type}`}>
            {notice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notice.text}</span>
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
              className="li-input"
              required
            />
          </div>

          <div className="li-form-group">
            <label className="li-label">Email Address (Registered)</label>
            <input
              type="email"
              value={user?.email || ''}
              className="li-input"
              disabled
              style={{ backgroundColor: '#f8fafc', color: 'var(--li-text-secondary)', cursor: 'not-allowed' }}
            />
          </div>

          <div className="li-form-group">
            <label className="li-label">Phone Number</label>
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
            <label className="li-label">Driver License Number</label>
            <input
              type="text"
              name="drivingLicenseNumber"
              value={formData.drivingLicenseNumber}
              onChange={handleInputChange}
              className="li-input"
              placeholder="DL-NY-847291"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="li-btn li-btn-primary"
            style={{ marginTop: '0.75rem' }}
          >
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

