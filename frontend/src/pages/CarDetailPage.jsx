import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import CarDiscussionBoard from '../components/CarDiscussionBoard';
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
  Heart,
  Send,
  Compass,
  FileCheck,
  Phone,
  Clock,
  Info
} from 'lucide-react';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Controlled reservation request form state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [requestData, setRequestData] = useState({
    startDate: todayStr,
    endDate: tomorrowStr,
    pickupLocation: '',
    dropoffLocation: '',
    tripDestination: '',
    customerPhone: user?.phone || '',
    customerLicense: user?.drivingLicenseNumber || '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [createdRental, setCreatedRental] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/cars/${id}`);
      const carData = res.data.data;
      setCar(carData);

      const userId = (user?.id || user?._id)?.toString();
      const liked = Boolean(
        userId && carData.likes && carData.likes.map((l) => (l._id || l).toString()).includes(userId)
      );
      setIsLiked(liked);
      setLikesCount(carData.likesCount || carData.likes?.length || 0);

      setRequestData((prev) => ({
        ...prev,
        pickupLocation: carData.location || '',
        dropoffLocation: carData.location || '',
        customerPhone: prev.customerPhone || user?.phone || '',
        customerLicense: prev.customerLicense || user?.drivingLicenseNumber || ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCar();
  }, [id, user]);

  const calculateDaysAndTotal = () => {
    if (!car || !requestData.startDate || !requestData.endDate) return { days: 0, total: 0 };
    const start = new Date(requestData.startDate);
    const end = new Date(requestData.endDate);
    const diffTime = end - start;
    if (diffTime <= 0) return { days: 0, total: 0 };
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days, total: days * car.dailyRate };
  };

  const { days, total } = calculateDaysAndTotal();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    setRequestError(null);
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save vehicles to your favorites.');
      return;
    }

    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await api.post(`/cars/${id}/like`);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
    } catch (e) {
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const validateForm = () => {
    const errors = {};
    const start = new Date(requestData.startDate);
    const end = new Date(requestData.endDate);

    if (!requestData.startDate) errors.startDate = 'Pickup date is required';
    if (!requestData.endDate) errors.endDate = 'Return date is required';
    if (start >= end) errors.endDate = 'Return date must be after pickup date';
    if (!requestData.pickupLocation.trim()) errors.pickupLocation = 'Pickup location is required';
    if (!requestData.customerPhone.trim()) errors.customerPhone = 'Contact phone number is required';
    if (!requestData.customerLicense.trim()) errors.customerLicense = 'Driving license number is required for verification';

    return errors;
  };

  // Ownership checks
  const carOwnerId = (car?.owner?._id || car?.owner)?.toString();
  const currentUserId = (user?.id || user?._id)?.toString();
  const isOwner = Boolean(user && carOwnerId && carOwnerId === currentUserId);
  const canDeleteListing = Boolean(isOwner || isAdmin);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/cars/${id}` } } });
      return;
    }

    if (isOwner) {
      setRequestError('You listed this vehicle. You cannot rent your own vehicle.');
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setRequestError(null);

    try {
      // SUBMIT RESERVATION REQUEST (NO PAYMENT UPFRONT!)
      const res = await api.post('/rentals', {
        carId: car._id,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        pickupLocation: requestData.pickupLocation.trim(),
        dropoffLocation: requestData.dropoffLocation.trim() || requestData.pickupLocation.trim(),
        tripDestination: requestData.tripDestination.trim(),
        customerPhone: requestData.customerPhone.trim(),
        customerLicense: requestData.customerLicense.trim().toUpperCase(),
        notes: requestData.notes.trim()
      });

      setCreatedRental(res.data.data);
      setRequestSuccess(true);
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Could not submit reservation request.');
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

      {/* REQUEST SUBMISSION CONFIRMATION SCREEN */}
      {requestSuccess ? (
        <div className="li-card li-state-card" style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <CheckCircle2 size={56} color="var(--li-success)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--li-text-primary)' }}>
            Reservation Request Submitted!
          </h2>
          <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Your request to rent <strong>{car.make} {car.model}</strong> for <strong>{days} {days === 1 ? 'day' : 'days'}</strong> has been delivered to host <strong>{car.ownerName || 'Vehicle Host'}</strong>.
          </p>

          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '1rem',
              borderRadius: '8px',
              maxWidth: '480px',
              margin: '0 auto 1.5rem',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, marginBottom: '0.25rem' }}>
              <Info size={16} /> Next Step: Host Approval & Payment
            </div>
            <p style={{ color: '#15803d', margin: 0, lineHeight: 1.45 }}>
              <strong>No payment was charged today.</strong> You will receive an instant alert in the top notification bar as soon as the host approves your trip. You can then pay <strong>₹{total.toLocaleString('en-IN')}</strong> to finalize your booking.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
          {/* Main Left Rail: Vehicle Info & Discussion */}
          <div className="li-detail-card-column" style={{ flex: '1 1 65%' }}>
            <div className="li-card li-detail-card">
              {/* Hero Image */}
              <div className="li-detail-hero-img-wrap" style={{ backgroundColor: '#f1f5f9', position: 'relative' }}>
                <img
                  src={car.imageUrl || fallbackImg}
                  alt={`${car.make} ${car.model}`}
                  className="li-detail-hero-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImg;
                  }}
                />

                {/* Floating Heart / Like Button */}
                <button
                  type="button"
                  onClick={handleToggleLike}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  title={isLiked ? 'Saved in Favorites' : 'Save for later'}
                >
                  <Heart size={20} color={isLiked ? '#ef4444' : '#64748b'} fill={isLiked ? '#ef4444' : 'none'} />
                </button>
              </div>

              {/* Title and Rate Header */}
              <div className="li-detail-title-row">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="li-badge li-badge-category">
                      {car.category}
                    </span>
                    {likesCount > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Heart size={12} fill="#ef4444" color="#ef4444" /> {likesCount} {likesCount === 1 ? 'person saved' : 'people saved'}
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--li-text-primary)' }}>
                    {car.make} {car.model}
                  </h1>
                  <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <MapPin size={14} /> {car.location} • Year {car.year} • Plate: <code>{car.licensePlate}</code>
                  </p>
                  {car.ownerName && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--li-text-secondary)', marginTop: '0.2rem' }}>
                      Vehicle Host: <strong>{car.ownerName}</strong>
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
                    <span className="li-detail-spec-label">Fuel Type</span>
                    <span className="li-detail-spec-val">{car.fuelType}</span>
                  </div>
                </div>
                <div className="li-detail-spec-box">
                  <Settings2 size={20} color="var(--li-primary)" />
                  <div>
                    <span className="li-detail-spec-label">Transmission</span>
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

              {/* Host Delete / Admin Controls */}
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
                      {isOwner ? 'You own this listing' : 'Admin Operations'}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                      Permanently delete this car from the active catalog.
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

            {/* DISCUSSION & INQUIRIES WITH HOST BOARD */}
            <CarDiscussionBoard
              carId={car._id}
              ownerName={car.ownerName}
              isOwner={isOwner}
            />
          </div>

          {/* Right Rail: Streamlined Reservation Request Box */}
          <aside className="li-booking-sidebar" style={{ flex: '1 1 35%' }}>
            <div className="li-card li-booking-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                <Calendar size={18} color="var(--li-primary)" />
                <h3 className="li-booking-card-title" style={{ margin: 0, fontSize: '1.15rem' }}>
                  Request to Reserve
                </h3>
              </div>
              <p className="li-booking-card-subtitle" style={{ marginBottom: '1.1rem' }}>
                No upfront payment required • Pay after host accepts
              </p>

              {requestError && (
                <div className="li-alert li-alert-danger" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{requestError}</span>
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
                    You cannot rent a car that you listed. Incoming booking requests from drivers will appear in your Bookings dashboard for your approval.
                  </p>
                  <Link to="/my-rentals" className="li-btn li-btn-outline li-btn-block li-btn-sm">
                    View Incoming Requests
                  </Link>
                </div>
              ) : (
                /* Complete Clean Reservation Request Form */
                <form onSubmit={handleRequestSubmit}>
                  {/* Row 1: Dates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                    <div className="li-form-group" style={{ marginBottom: 0 }}>
                      <label className="li-label" style={{ fontSize: '0.775rem' }}>Pickup Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        min={todayStr}
                        value={requestData.startDate}
                        onChange={handleInputChange}
                        className={`li-input ${formErrors.startDate ? 'li-input-error' : ''}`}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                      />
                      {formErrors.startDate && (
                        <span className="li-error-msg">{formErrors.startDate}</span>
                      )}
                    </div>

                    <div className="li-form-group" style={{ marginBottom: 0 }}>
                      <label className="li-label" style={{ fontSize: '0.775rem' }}>Return Date *</label>
                      <input
                        type="date"
                        name="endDate"
                        min={requestData.startDate || todayStr}
                        value={requestData.endDate}
                        onChange={handleInputChange}
                        className={`li-input ${formErrors.endDate ? 'li-input-error' : ''}`}
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                      />
                      {formErrors.endDate && (
                        <span className="li-error-msg">{formErrors.endDate}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Trip Place (Optional) */}
                  <div className="li-form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="li-label" style={{ fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Compass size={12} /> Trip Destination / Place (Optional)
                    </label>
                    <input
                      type="text"
                      name="tripDestination"
                      value={requestData.tripDestination}
                      onChange={handleInputChange}
                      placeholder="e.g. Udaipur road trip / Local business travel"
                      className="li-input"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                    />
                  </div>

                  {/* Row 3: Pickup Location */}
                  <div className="li-form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="li-label" style={{ fontSize: '0.775rem' }}>Pickup Branch *</label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={requestData.pickupLocation}
                      onChange={handleInputChange}
                      className={`li-input ${formErrors.pickupLocation ? 'li-input-error' : ''}`}
                      placeholder="Branch or meeting location"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                    />
                    {formErrors.pickupLocation && (
                      <span className="li-error-msg">{formErrors.pickupLocation}</span>
                    )}
                  </div>

                  {/* Row 4: Driving License & Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                    <div className="li-form-group" style={{ marginBottom: 0 }}>
                      <label className="li-label" style={{ fontSize: '0.775rem' }}>Driving License *</label>
                      <input
                        type="text"
                        name="customerLicense"
                        value={requestData.customerLicense}
                        onChange={handleInputChange}
                        className={`li-input ${formErrors.customerLicense ? 'li-input-error' : ''}`}
                        placeholder="DL-04-2021..."
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.6rem', textTransform: 'uppercase' }}
                      />
                      {formErrors.customerLicense && (
                        <span className="li-error-msg">{formErrors.customerLicense}</span>
                      )}
                    </div>

                    <div className="li-form-group" style={{ marginBottom: 0 }}>
                      <label className="li-label" style={{ fontSize: '0.775rem' }}>Contact Phone *</label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={requestData.customerPhone}
                        onChange={handleInputChange}
                        className={`li-input ${formErrors.customerPhone ? 'li-input-error' : ''}`}
                        placeholder="+91 98765 43210"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                      />
                      {formErrors.customerPhone && (
                        <span className="li-error-msg">{formErrors.customerPhone}</span>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Notes to Host */}
                  <div className="li-form-group" style={{ marginBottom: '0.85rem' }}>
                    <label className="li-label" style={{ fontSize: '0.775rem' }}>Message for Host (Optional)</label>
                    <textarea
                      name="notes"
                      rows="2"
                      value={requestData.notes}
                      onChange={handleInputChange}
                      className="li-textarea"
                      placeholder="Estimated arrival time, specific preferences..."
                      style={{ fontSize: '0.8rem' }}
                    />
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="li-price-summary-box" style={{ marginBottom: '1rem', padding: '0.75rem' }}>
                    <div className="li-price-row">
                      <span>Daily Rate</span>
                      <span>₹{(car.dailyRate || 0).toLocaleString('en-IN')}.00</span>
                    </div>
                    <div className="li-price-row">
                      <span>Rental Duration</span>
                      <span>{days} {days === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="li-price-row li-price-total-row">
                      <span>Total Trip Rate</span>
                      <span style={{ color: 'var(--li-primary)', fontSize: '1.15rem' }}>
                        ₹{total.toLocaleString('en-IN')}.00
                      </span>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                      ✓ Pay only after host approval
                    </span>
                  </div>

                  {isAuthenticated ? (
                    <button
                      type="submit"
                      disabled={submitting || car.status !== 'available' || days <= 0}
                      className="li-btn li-btn-primary li-btn-block"
                      style={{ padding: '0.65rem' }}
                    >
                      {submitting ? 'Sending Request...' : 'Send Reservation Request to Host'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <Link
                        to="/login"
                        state={{ from: { pathname: `/cars/${id}` } }}
                        className="li-btn li-btn-primary li-btn-block"
                      >
                        Sign in to Request Vehicle
                      </Link>
                      <span style={{ fontSize: '0.725rem', color: 'var(--li-text-secondary)', textAlign: 'center' }}>
                        Guests can view vehicle specs, but booking requires an account
                      </span>
                    </div>
                  )}
                </form>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CarDetailPage;
