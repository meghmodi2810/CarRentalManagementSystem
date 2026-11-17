import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import FakePaymentModal from '../components/FakePaymentModal';
import { getPlaceholderForCategory } from '../utils/carPlaceholders';
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
  Car,
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

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
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    if (!formData.pickupLocation.trim()) errors.pickupLocation = 'Pickup location is required';
    if (!formData.dropoffLocation.trim()) errors.dropoffLocation = 'Dropoff location is required';

    return errors;
  };

  // Check if current logged-in user is the owner/host of this car
  const carOwnerId = (car?.owner?._id || car?.owner)?.toString();
  const currentUserId = (user?.id || user?._id)?.toString();
  const isOwner = Boolean(user && carOwnerId && carOwnerId === currentUserId);
  const canDeleteListing = Boolean(isOwner || isAdmin);

  const handleOpenPayment = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/cars/${id}` } } });
      return;
    }

    if (isOwner) {
      setBookingError('You listed this vehicle. You cannot rent your own vehicle.');
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsPaymentModalOpen(false);
    setSubmitting(true);
    setBookingError(null);

    try {
      const res = await api.post('/rentals', {
        carId: car._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        notes: formData.notes,
        paymentDetails
      });

      setBookingResult(res.data.data);
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Could not complete reservation request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!window.confirm(`Are you sure you want to permanently remove "${car.make} ${car.model}" from the fleet?`)) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/cars/${car._id}`);
      navigate('/fleet', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove vehicle listing.');
      setDeleting(false);
    }
  };

  if (loading) return <div className="linkedin-container"><LoadingSpinner message="Retrieving vehicle specifications..." /></div>;
  if (error) return <div className="linkedin-container"><ErrorMessage message={error} onRetry={fetchCar} /></div>;
  if (!car) return null;

  const fallbackImg = getPlaceholderForCategory(car.category);

  return (
    <div className="linkedin-container">
      <Link to="/fleet" className="li-back-btn">
        <ArrowLeft size={16} /> Back to fleet feed
      </Link>

      {bookingSuccess ? (
        <div className="li-card li-state-card" style={{ maxWidth: '620px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <CheckCircle2 size={54} color="var(--li-success)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--li-text-primary)' }}>
            Rental Request Submitted!
          </h2>
          <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Your booking request and simulated authorization of <strong>₹{total.toLocaleString('en-IN')}</strong> have been delivered to the vehicle host (<strong>{car.ownerName || 'Vehicle Host'}</strong>). The car will be confirmed once the host accepts your request.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/my-rentals" className="li-btn li-btn-primary">
              View My Bookings
            </Link>
            <Link to="/fleet" className="li-btn li-btn-subtle">
              Browse More Cars
            </Link>
          </div>
        </div>
      ) : (
        <div className="li-detail-layout">
          {/* Main Left Card: Vehicle Info */}
          <div className="li-card li-detail-card">
            <div className="li-detail-hero-img-wrap" style={{ backgroundColor: '#f1f5f9' }}>
              <img
                src={car.imageUrl || fallbackImg}
                alt={`${car.make} ${car.model}`}
                className="li-detail-hero-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImg;
                }}
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
                {car.ownerName && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--li-text-secondary)', marginTop: '0.2rem' }}>
                    Listed by: <strong>{car.ownerName}</strong>
                  </p>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--li-primary)' }}>
                  ₹{(car.dailyRate || 0).toLocaleString('en-IN')}
                </span>
                <span style={{ color: 'var(--li-text-secondary)', fontSize: '0.825rem', display: 'block' }}>
                  per day
                </span>
              </div>
            </div>

            {/* Specifications Grid */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', marginTop: '1.25rem' }}>
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
              <div style={{ marginTop: '1.25rem' }}>
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

            {/* Host / Owner Management Controls */}
            {canDeleteListing && (
              <div
                style={{
                  marginTop: '1.75rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--li-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--li-text-primary)' }}>
                    {isOwner ? 'You are the host of this vehicle' : 'Admin Controls'}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                    Remove this car listing from the DriveFlow public fleet catalog.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDeleteListing}
                  disabled={deleting}
                  className="li-btn li-btn-danger-outline li-btn-sm"
                >
                  <Trash2 size={14} /> {deleting ? 'Removing...' : 'Remove Listing'}
                </button>
              </div>
            )}
          </div>

          {/* Sticky Booking Sidebar */}
          <aside className="li-booking-sidebar">
            <div className="li-card li-booking-card">
              <h3 className="li-booking-card-title">Book This Vehicle</h3>
              <p className="li-booking-card-subtitle">
                Requests require host approval • Free cancellation
              </p>

              {bookingError && (
                <div className="li-alert li-alert-danger" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{bookingError}</span>
                </div>
              )}

              {isOwner ? (
                /* Vehicle Owner Message */
                <div
                  style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginTop: '0.5rem'
                  }}
                >
                  <AlertCircle size={28} color="#d97706" style={{ margin: '0 auto 0.5rem' }} />
                  <strong style={{ fontSize: '0.95rem', color: '#92400e', display: 'block', marginBottom: '0.35rem' }}>
                    You Listed This Vehicle
                  </strong>
                  <p style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.45, marginBottom: '1rem' }}>
                    You cannot rent a car that you listed. Customer booking requests for this car will appear in your "Bookings" dashboard for your approval.
                  </p>
                  <Link to="/my-rentals" className="li-btn li-btn-outline li-btn-block li-btn-sm">
                    View Incoming Requests
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleOpenPayment}>
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
                      placeholder="e.g. Airport T2 Hub"
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
                      placeholder="e.g. Airport T2 Hub"
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
                      placeholder="Flight arrival, extra assistance..."
                    />
                  </div>

                  {/* Price Breakdown in INR */}
                  <div className="li-price-summary-box">
                    <div className="li-price-row">
                      <span>Daily Rate</span>
                      <span>₹{(car.dailyRate || 0).toLocaleString('en-IN')}.00</span>
                    </div>
                    <div className="li-price-row">
                      <span>Rental Duration</span>
                      <span>{days} {days === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="li-price-row li-price-total-row">
                      <span>Total Amount</span>
                      <span style={{ color: 'var(--li-primary)' }}>₹{total.toLocaleString('en-IN')}.00</span>
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <button
                      type="submit"
                      disabled={submitting || car.status !== 'available' || days <= 0}
                      className="li-btn li-btn-primary li-btn-block"
                    >
                      {submitting ? 'Processing...' : `Proceed to Pay ₹${total.toLocaleString('en-IN')}`}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <Link
                        to="/login"
                        state={{ from: { pathname: `/cars/${id}` } }}
                        className="li-btn li-btn-primary li-btn-block"
                      >
                        Sign in to Reserve
                      </Link>
                      <span style={{ fontSize: '0.725rem', color: 'var(--li-text-secondary)', textAlign: 'center' }}>
                        Guests can view specs, but booking requires an account
                      </span>
                    </div>
                  )}
                </form>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Fake Payment Gateway Modal */}
      <FakePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={total}
        carTitle={`${car.make} ${car.model}`}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default CarDetailPage;
