import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  Users,
  Fuel,
  Settings2,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Car
} from 'lucide-react';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controlled booking form state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    startDate: todayStr,
    endDate: tomorrowStr,
    pickupLocation: '',
    dropoffLocation: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const fetchCar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/cars/${id}`);
      setCar(res.data.data);
      setFormData((prev) => ({
        ...prev,
        pickupLocation: res.data.data.location,
        dropoffLocation: res.data.data.location
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCar();
  }, [id]);

  const calculateTotal = () => {
    if (!car || !formData.startDate || !formData.endDate) return { days: 0, total: 0 };
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end - start;
    if (diffTime <= 0) return { days: 0, total: 0 };
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days, total: days * car.dailyRate };
  };

  const { days, total } = calculateTotal();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    setBookingError(null);
  };

  const validateForm = () => {
    const errors = {};
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (start >= end) errors.endDate = 'End date must be after pickup date';
    if (!formData.pickupLocation.trim()) errors.pickupLocation = 'Pickup branch is required';
    if (!formData.dropoffLocation.trim()) errors.dropoffLocation = 'Dropoff branch is required';

    return errors;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/', { state: { from: { pathname: `/cars/${id}` } } });
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    try {
      await api.post('/rentals', {
        carId: car._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        notes: formData.notes
      });
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Could not complete reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="linkedin-container"><LoadingSpinner message="Retrieving vehicle specifications..." /></div>;
  if (error) return <div className="linkedin-container"><ErrorMessage message={error} onRetry={fetchCar} /></div>;
  if (!car) return null;

  return (
    <div className="linkedin-container">
      <Link to="/" className="li-back-btn">
        <ArrowLeft size={16} /> Back to fleet feed
      </Link>

      {bookingSuccess ? (
        <div className="li-card li-state-card" style={{ maxWidth: '580px', margin: '2rem auto' }}>
          <CheckCircle2 size={54} color="var(--li-success)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Reservation Confirmed!
          </h2>
          <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You have successfully booked <strong>{car.make} {car.model}</strong> for {days} {days === 1 ? 'day' : 'days'}. Reference details have been saved to your profile.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/my-rentals" className="li-btn li-btn-primary">
              View My Bookings
            </Link>
            <Link to="/" className="li-btn li-btn-subtle">
              Browse Fleet
            </Link>
          </div>
        </div>
      ) : (
        <div className="li-detail-layout">
          {/* Main Left Card: Vehicle Info */}
          <div className="li-card li-detail-card">
            <div className="li-detail-hero-img-wrap">
              <img
                src={car.imageUrl}
                alt={`${car.make} ${car.model}`}
                className="li-detail-hero-img"
              />
            </div>

            <div className="li-detail-title-row">
              <div>
                <span className="li-badge li-badge-category" style={{ marginBottom: '0.35rem' }}>
                  {car.category}
                </span>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--li-text-primary)' }}>
                  {car.make} {car.model}
                </h1>
                <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <MapPin size={14} /> {car.location} • Year {car.year} • Plate: <code>{car.licensePlate}</code>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--li-primary)' }}>
                  ${car.dailyRate}
                </span>
                <span style={{ color: 'var(--li-text-secondary)', fontSize: '0.825rem', display: 'block' }}>
                  per day
                </span>
              </div>
            </div>

            {/* Specifications Grid */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Vehicle Specifications
            </h3>
            <div className="li-detail-specs-grid">
              <div className="li-detail-spec-box">
                <Users size={20} color="var(--li-primary)" />
                <div>
                  <span className="li-detail-spec-label">Seating</span>
                  <span className="li-detail-spec-val">{car.seatingCapacity} Passengers</span>
                </div>
              </div>
              <div className="li-detail-spec-box">
                <Fuel size={20} color="var(--li-primary)" />
                <div>
                  <span className="li-detail-spec-label">Fuel</span>
                  <span className="li-detail-spec-val">{car.fuelType}</span>
                </div>
              </div>
              <div className="li-detail-spec-box">
                <Settings2 size={20} color="var(--li-primary)" />
                <div>
                  <span className="li-detail-spec-label">Gearbox</span>
                  <span className="li-detail-spec-val">{car.transmission}</span>
                </div>
              </div>
            </div>

            {/* Features Checklist */}
            {car.features && car.features.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Included Features & Amenities
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                  {car.features.map((feature, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                        color: 'var(--li-text-secondary)'
                      }}
                    >
                      <CheckCircle2 size={16} color="var(--li-success)" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Booking Sidebar */}
          <aside className="li-booking-sidebar">
            <div className="li-card li-booking-card">
              <h3 className="li-booking-card-title">Book This Vehicle</h3>
              <p className="li-booking-card-subtitle">
                Instant confirmation • Free cancellation up to 24h
              </p>

              {bookingError && (
                <div className="li-alert li-alert-danger">
                  <AlertCircle size={16} />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit}>
                <div className="li-form-group">
                  <label className="li-label">Pickup Date</label>
                  <input
                    type="date"
                    name="startDate"
                    min={todayStr}
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`li-input ${formErrors.startDate ? 'li-input-error' : ''}`}
                  />
                  {formErrors.startDate && (
                    <span className="li-error-msg">{formErrors.startDate}</span>
                  )}
                </div>

                <div className="li-form-group">
                  <label className="li-label">Return Date</label>
                  <input
                    type="date"
                    name="endDate"
                    min={formData.startDate || todayStr}
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`li-input ${formErrors.endDate ? 'li-input-error' : ''}`}
                  />
                  {formErrors.endDate && (
                    <span className="li-error-msg">{formErrors.endDate}</span>
                  )}
                </div>

                <div className="li-form-group">
                  <label className="li-label">Pickup Branch</label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    className={`li-input ${formErrors.pickupLocation ? 'li-input-error' : ''}`}
                    placeholder="e.g. Downtown Central Hub"
                  />
                  {formErrors.pickupLocation && (
                    <span className="li-error-msg">{formErrors.pickupLocation}</span>
                  )}
                </div>

                <div className="li-form-group">
                  <label className="li-label">Dropoff Branch</label>
                  <input
                    type="text"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleInputChange}
                    className={`li-input ${formErrors.dropoffLocation ? 'li-input-error' : ''}`}
                    placeholder="e.g. Downtown Central Hub"
                  />
                  {formErrors.dropoffLocation && (
                    <span className="li-error-msg">{formErrors.dropoffLocation}</span>
                  )}
                </div>

                <div className="li-form-group">
                  <label className="li-label">Trip Notes (Optional)</label>
                  <textarea
                    name="notes"
                    rows="2"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="li-textarea"
                    placeholder="Flight arrival, extra child seat..."
                  />
                </div>

                {/* Price Breakdown */}
                <div className="li-price-summary-box">
                  <div className="li-price-row">
                    <span>Daily Rate</span>
                    <span>${car.dailyRate}.00</span>
                  </div>
                  <div className="li-price-row">
                    <span>Rental Duration</span>
                    <span>{days} {days === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="li-price-row li-price-total-row">
                    <span>Estimated Total</span>
                    <span style={{ color: 'var(--li-primary)' }}>${total}.00</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || car.status !== 'available' || days <= 0}
                  className="li-btn li-btn-primary li-btn-block"
                >
                  {submitting
                    ? 'Processing...'
                    : isAuthenticated
                    ? 'Confirm Reservation'
                    : 'Sign in to Reserve'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CarDetailPage;
