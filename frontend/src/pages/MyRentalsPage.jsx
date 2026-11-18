import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import { getPlaceholderForCategory } from '../utils/carPlaceholders';
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  Ban,
  Car,
  FileText,
  Printer,
  X,
  CheckCircle2,
  Inbox,
  Check,
  Trash2,
  User,
  Plus,
  CreditCard,
  Heart,
  Compass,
  ArrowRight
} from 'lucide-react';

const MyRentalsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Tab state: 'bookings' | 'host_requests' | 'my_listings' | 'saved'
  const initialTab = searchParams.get('tab') || 'bookings';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data states
  const [rentals, setRentals] = useState([]);
  const [hostRequests, setHostRequests] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [savedCars, setSavedCars] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Selected rental for Receipt / Invoice Modal
  const [selectedRental, setSelectedRental] = useState(null);

  // Active rental for Payment Gateway Modal
  const [payingRental, setPayingRental] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rentalsRes, hostRes, carsRes, savedRes] = await Promise.all([
        api.get('/rentals/my-rentals').catch(() => ({ data: { data: [] } })),
        api.get('/rentals/host-requests').catch(() => ({ data: { data: [] } })),
        api.get('/cars').catch(() => ({ data: { data: [] } })),
        api.get('/cars/saved').catch(() => ({ data: { data: [] } }))
      ]);

      setRentals(rentalsRes.data.data || []);
      setHostRequests(hostRes.data.data || []);
      setSavedCars(savedRes.data.data || []);

      const currentUserId = (user?.id || user?._id)?.toString();
      const userCars = (carsRes.data.data || []).filter((c) => {
        const ownerId = (c.owner?._id || c.owner)?.toString();
        return ownerId === currentUserId;
      });
      setMyListings(userCars);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve rental records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Customer cancel booking
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation request?')) return;
    try {
      await api.patch(`/rentals/${id}/status`, { status: 'cancelled' });
      setActionNotice({ type: 'success', text: 'Reservation request cancelled successfully.' });
      fetchAllData();
    } catch (err) {
      setActionNotice({
        type: 'danger',
        text: err.response?.data?.message || 'Could not cancel reservation.'
      });
    }
  };

  // Host accept (approve) / decline request
  const handleHostAction = async (id, targetStatus) => {
    const isApprove = targetStatus === 'approved';
    const actionLabel = isApprove ? 'approve' : 'decline';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this booking request?`)) return;

    try {
      await api.patch(`/rentals/${id}/status`, { status: targetStatus });
      setActionNotice({
        type: 'success',
        text: isApprove
          ? 'Booking approved! The customer has been notified to complete the payment.'
          : 'Booking request declined.'
      });
      fetchAllData();
    } catch (err) {
      setActionNotice({
        type: 'danger',
        text: err.response?.data?.message || `Failed to ${actionLabel} request.`
      });
    }
  };

  // Complete Payment for Approved Booking
  const handlePaymentSuccess = async (paymentDetails) => {
    if (!payingRental) return;

    try {
      await api.patch(`/rentals/${payingRental._id}/pay`, { paymentDetails });
      setActionNotice({
        type: 'success',
        text: 'Payment completed successfully! Your vehicle reservation is now confirmed.'
      });
      setPayingRental(null);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment submission failed.');
    }
  };

  // Remove vehicle listing
  const handleRemoveListing = async (carId, carName) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${carName}" from your listings?`)) return;

    try {
      await api.delete(`/cars/${carId}`);
      setActionNotice({ type: 'success', text: `"${carName}" removed from the fleet successfully.` });
      fetchAllData();
    } catch (err) {
      setActionNotice({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to remove vehicle.'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const pendingHostCount = hostRequests.filter((r) => r.status === 'pending').length;
  const approvedActionCount = rentals.filter((r) => r.status === 'approved').length;

  return (
    <div className="linkedin-container" style={{ maxWidth: '900px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--li-text-primary)' }}>
            Bookings & Reservations Hub
          </h1>
          <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.85rem' }}>
            Track your trips, approve incoming guest requests, and manage your saved vehicles
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/add-car" className="li-btn li-btn-primary li-btn-sm">
            <Plus size={14} /> List a Vehicle
          </Link>
          <Link to="/fleet" className="li-btn li-btn-outline li-btn-sm">
            Browse Fleet
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className={`li-alert li-alert-${actionNotice.type}`} style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} />
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Modern Multi-Tab Bar */}
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--li-border)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'bookings' ? 700 : 500,
            color: activeTab === 'bookings' ? 'var(--li-primary)' : 'var(--li-text-secondary)',
            borderBottom: `3px solid ${activeTab === 'bookings' ? 'var(--li-primary)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Calendar size={16} /> My Bookings ({rentals.length})
          {approvedActionCount > 0 && (
            <span
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px'
              }}
            >
              {approvedActionCount} Ready to Pay
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('host_requests')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'host_requests' ? 700 : 500,
            color: activeTab === 'host_requests' ? 'var(--li-primary)' : 'var(--li-text-secondary)',
            borderBottom: `3px solid ${activeTab === 'host_requests' ? 'var(--li-primary)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Inbox size={16} /> Incoming Host Requests ({hostRequests.length})
          {pendingHostCount > 0 && (
            <span
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px'
              }}
            >
              {pendingHostCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('my_listings')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'my_listings' ? 700 : 500,
            color: activeTab === 'my_listings' ? 'var(--li-primary)' : 'var(--li-text-secondary)',
            borderBottom: `3px solid ${activeTab === 'my_listings' ? 'var(--li-primary)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Car size={16} /> My Listed Vehicles ({myListings.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: activeTab === 'saved' ? 700 : 500,
            color: activeTab === 'saved' ? 'var(--li-primary)' : 'var(--li-text-secondary)',
            borderBottom: `3px solid ${activeTab === 'saved' ? 'var(--li-primary)' : 'transparent'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Heart size={16} /> Saved for Later ({savedCars.length})
        </button>
      </div>

      {loading && <LoadingSpinner message="Retrieving dashboard data..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={fetchAllData} />}

      {/* ========================================================
          TAB 1: CUSTOMER'S PERSONAL BOOKINGS
          ======================================================== */}
      {!loading && !error && activeTab === 'bookings' && (
        <>
          {rentals.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No bookings yet"
              message="You haven't requested any vehicle bookings. Browse our fleet to find the perfect car for your next journey."
              actionText="Explore Fleet"
              actionLink="/fleet"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rentals.map((rental) => {
                const car = rental.car;
                const fallbackImg = getPlaceholderForCategory(car?.category || 'Sedan');
                const isPending = rental.status === 'pending';
                const isApproved = rental.status === 'approved';
                const isConfirmed = rental.status === 'confirmed';

                return (
                  <div
                    key={rental._id}
                    className="li-card"
                    style={{
                      padding: '1.25rem',
                      borderLeft: isApproved
                        ? '4px solid #16a34a'
                        : isPending
                        ? '4px solid #f59e0b'
                        : '1px solid var(--li-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '84px',
                            height: '60px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid var(--li-border)'
                          }}
                        >
                          <img
                            src={car?.imageUrl || fallbackImg}
                            alt={car?.model || 'Vehicle'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = fallbackImg;
                            }}
                          />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--li-text-primary)' }}>
                            {car ? `${car.make} ${car.model}` : 'Vehicle Reserved'}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                            Ref: <code>#{rental._id.slice(-6).toUpperCase()}</code> • {rental.totalDays} {rental.totalDays === 1 ? 'day' : 'days'}
                            {rental.tripDestination && ` • Destination: ${rental.tripDestination}`}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          className={`li-badge ${
                            isApproved
                              ? 'li-badge-category'
                              : isConfirmed
                              ? 'li-badge-available'
                              : isPending
                              ? 'li-badge-maintenance'
                              : 'li-badge-rented'
                          }`}
                          style={{ fontWeight: 700 }}
                        >
                          {isPending
                            ? 'Awaiting Host Approval'
                            : isApproved
                            ? 'Approved • Payment Required'
                            : isConfirmed
                            ? 'Confirmed & Booked'
                            : rental.status}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)', marginTop: '4px' }}>
                          Payment: {rental.paymentStatus?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.75rem',
                        padding: '0.75rem 0',
                        borderTop: '1px solid var(--li-border)',
                        borderBottom: '1px solid var(--li-border)',
                        fontSize: '0.825rem'
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>Rental Dates</span>
                        <strong>{formatDate(rental.startDate)} → {formatDate(rental.endDate)}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>Pickup Location</span>
                        <span>{rental.pickupLocation}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>Total Amount</span>
                        <strong style={{ color: 'var(--li-primary)', fontSize: '0.95rem' }}>
                          ₹{Number(rental.totalAmount || 0).toLocaleString('en-IN')}.00
                        </strong>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem' }}>
                      <div>
                        {isPending && (
                          <span style={{ fontSize: '0.775rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} /> No payment charged yet. Host will review your request.
                          </span>
                        )}
                        {isApproved && (
                          <span style={{ fontSize: '0.775rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> Host approved your trip! Complete payment to confirm.
                          </span>
                        )}
                        {isConfirmed && (
                          <span style={{ fontSize: '0.775rem', color: 'var(--li-text-secondary)' }}>
                            Txn Ref: <code>{rental.paymentDetails?.transactionId || 'PAID'}</code>
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {/* PAY NOW BUTTON FOR APPROVED RENTALS */}
                        {isApproved && (
                          <button
                            type="button"
                            onClick={() => setPayingRental(rental)}
                            className="li-btn li-btn-primary li-btn-sm"
                            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }}
                          >
                            <CreditCard size={14} /> Pay ₹{Number(rental.totalAmount).toLocaleString('en-IN')} Now
                          </button>
                        )}

                        {isConfirmed && (
                          <button
                            onClick={() => setSelectedRental(rental)}
                            className="li-btn li-btn-subtle li-btn-sm"
                          >
                            <FileText size={14} /> View Receipt
                          </button>
                        )}

                        {['pending', 'approved'].includes(rental.status) && (
                          <button
                            onClick={() => handleCancelBooking(rental._id)}
                            className="li-btn li-btn-danger-outline li-btn-sm"
                          >
                            <Ban size={14} /> Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================
          TAB 2: INCOMING HOST REQUESTS FOR YOUR LISTED CARS
          ======================================================== */}
      {!loading && !error && activeTab === 'host_requests' && (
        <>
          {hostRequests.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No incoming guest requests"
              message="When verified customers submit reservation requests for your listed vehicles, they will appear here with travel details for you to approve."
              actionText="List a Vehicle"
              actionLink="/add-car"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {hostRequests.map((req) => {
                const car = req.car;
                const customer = req.customer;
                const fallbackImg = getPlaceholderForCategory(car?.category || 'Sedan');
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isConfirmed = req.status === 'confirmed';

                return (
                  <div
                    key={req._id}
                    className="li-card"
                    style={{
                      padding: '1.25rem',
                      borderLeft: isPending ? '4px solid #f59e0b' : isConfirmed ? '4px solid #16a34a' : '1px solid var(--li-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '84px',
                            height: '60px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid var(--li-border)'
                          }}
                        >
                          <img
                            src={car?.imageUrl || fallbackImg}
                            alt={car?.model || 'Vehicle'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = fallbackImg;
                            }}
                          />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--li-text-primary)' }}>
                            {car ? `${car.make} ${car.model}` : 'Vehicle'} ({car?.licensePlate || ''})
                          </h3>
                          <span style={{ fontSize: '0.78rem', color: 'var(--li-text-secondary)' }}>
                            Guest: <strong>{customer?.name || 'Verified Renter'}</strong> ({customer?.email || 'N/A'})
                          </span>
                        </div>
                      </div>

                      <span className={`li-badge li-badge-${isPending ? 'maintenance' : isConfirmed ? 'available' : 'category'}`}>
                        {isPending ? 'Awaiting Your Approval' : isApproved ? 'Approved • Awaiting Payment' : isConfirmed ? 'Confirmed & Paid' : req.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.75rem',
                        padding: '0.75rem 0',
                        borderTop: '1px solid var(--li-border)',
                        borderBottom: '1px solid var(--li-border)',
                        fontSize: '0.825rem'
                      }}
                    >
                      <div>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>Trip Duration</span>
                        <strong>{formatDate(req.startDate)} → {formatDate(req.endDate)}</strong>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>
                          ({req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'})
                        </span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>Guest Details</span>
                        <span>Phone: {req.customerPhone || customer?.phone || 'Verified on booking'}</span>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>
                          License: {req.customerLicense || customer?.drivingLicenseNumber || 'Provided'}
                        </span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>Trip Earnings</span>
                        <strong style={{ color: 'var(--li-primary)', fontSize: '0.95rem' }}>
                          ₹{Number(req.totalAmount || 0).toLocaleString('en-IN')}.00
                        </strong>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: isConfirmed ? '#16a34a' : 'var(--li-text-secondary)' }}>
                          {isConfirmed ? '✓ Payment Received' : 'Collect on Approval'}
                        </span>
                      </div>
                    </div>

                    {req.tripDestination && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--li-text-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Compass size={14} color="var(--li-primary)" />
                        Destination Planned: <strong>{req.tripDestination}</strong>
                      </p>
                    )}

                    {req.notes && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--li-text-secondary)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                        Guest Note: "{req.notes}"
                      </p>
                    )}

                    {/* Host Approval Action */}
                    {isPending ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.85rem' }}>
                        <button
                          onClick={() => handleHostAction(req._id, 'cancelled')}
                          className="li-btn li-btn-danger-outline li-btn-sm"
                        >
                          <Ban size={14} /> Decline Request
                        </button>
                        <button
                          onClick={() => handleHostAction(req._id, 'approved')}
                          className="li-btn li-btn-primary li-btn-sm"
                        >
                          <Check size={14} /> Accept & Approve Request
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                          Status: <strong>{req.status?.toUpperCase()}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================
          TAB 3: MY LISTED VEHICLES
          ======================================================== */}
      {!loading && !error && activeTab === 'my_listings' && (
        <>
          {myListings.length === 0 ? (
            <EmptyState
              icon={Car}
              title="No listed vehicles"
              message="You haven't listed any vehicles yet. List your car on DriveFlow to receive rental requests and earn passive income."
              actionText="List a Vehicle"
              actionLink="/add-car"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myListings.map((car) => {
                const fallbackImg = getPlaceholderForCategory(car.category);

                return (
                  <div key={car._id} className="li-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '84px',
                            height: '60px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid var(--li-border)'
                          }}
                        >
                          <img
                            src={car.imageUrl || fallbackImg}
                            alt={`${car.make} ${car.model}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = fallbackImg;
                            }}
                          />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--li-text-primary)' }}>
                            {car.make} {car.model} ({car.year})
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                            Plate: <code>{car.licensePlate}</code> • {car.category} • {car.location}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--li-primary)' }}>
                            ₹{(car.dailyRate || 0).toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--li-text-secondary)', display: 'block' }}>
                            / day
                          </span>
                        </div>

                        <Link to={`/cars/${car._id}`} className="li-btn li-btn-subtle li-btn-sm">
                          View
                        </Link>

                        <button
                          onClick={() => handleRemoveListing(car._id, `${car.make} ${car.model}`)}
                          className="li-btn li-btn-danger-outline li-btn-sm"
                          title="Remove Listing"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================
          TAB 4: SAVED VEHICLES (LIKED FOR LATER)
          ======================================================== */}
      {!loading && !error && activeTab === 'saved' && (
        <>
          {savedCars.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No saved vehicles yet"
              message="Click the heart icon on any vehicle in the fleet feed to save it to your personal favorites for quick access later."
              actionText="Explore Fleet"
              actionLink="/fleet"
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {savedCars.map((car) => {
                const fallbackImg = getPlaceholderForCategory(car.category);
                return (
                  <div key={car._id} className="li-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ height: '140px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f1f5f9', marginBottom: '0.75rem' }}>
                        <img
                          src={car.imageUrl || fallbackImg}
                          alt={`${car.make} ${car.model}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackImg;
                          }}
                        />
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--li-text-primary)' }}>
                        {car.make} {car.model}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                        {car.category} • {car.location} • Year {car.year}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--li-border)' }}>
                      <strong style={{ color: 'var(--li-primary)', fontSize: '1rem' }}>
                        ₹{Number(car.dailyRate || 0).toLocaleString('en-IN')}/day
                      </strong>
                      <Link to={`/cars/${car._id}`} className="li-btn li-btn-primary li-btn-sm">
                        View & Book
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* REAL PAYMENT GATEWAY MODAL (FOR APPROVED BOOKINGS) */}
      {payingRental && (
        <PaymentGatewayModal
          isOpen={Boolean(payingRental)}
          onClose={() => setPayingRental(null)}
          amount={payingRental.totalAmount}
          carTitle={payingRental.car ? `${payingRental.car.make} ${payingRental.car.model}` : 'Vehicle Booking'}
          bookingId={payingRental._id}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Invoice / Receipt Modal */}
      {selectedRental && (
        <div className="li-modal-overlay" onClick={() => setSelectedRental(null)}>
          <div className="li-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="li-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Car size={20} color="var(--li-primary)" />
                <strong style={{ fontSize: '1.1rem' }}>DriveFlow Rental Receipt</strong>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ borderBottom: '1px solid var(--li-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--li-text-secondary)' }}>
                <span>Invoice ID: <code>#{selectedRental._id.toUpperCase()}</code></span>
                <span>{new Date(selectedRental.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--li-text-secondary)' }}>Reserved Vehicle</span>
                <strong>{selectedRental.car?.make} {selectedRental.car?.model}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--li-text-secondary)' }}>License Plate</span>
                <code>{selectedRental.car?.licensePlate || 'N/A'}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--li-text-secondary)' }}>Rental Period</span>
                <span>{formatDate(selectedRental.startDate)} - {formatDate(selectedRental.endDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--li-text-secondary)' }}>Duration & Rate</span>
                <span>{selectedRental.totalDays} {selectedRental.totalDays === 1 ? 'Day' : 'Days'} @ ₹{selectedRental.dailyRate}/day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--li-text-secondary)' }}>Pickup Location</span>
                <span>{selectedRental.pickupLocation}</span>
              </div>
              {selectedRental.tripDestination && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--li-text-secondary)' }}>Destination</span>
                  <span>{selectedRental.tripDestination}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--li-text-secondary)' }}>Payment Status</span>
                <span className="li-badge li-badge-available">PAID ({selectedRental.paymentDetails?.method || 'UPI'})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--li-text-secondary)' }}>Transaction Ref</span>
                <code>{selectedRental.paymentDetails?.transactionId || 'TXN-CONFIRMED'}</code>
              </div>
            </div>

            <div
              style={{
                borderTop: '2px dashed var(--li-border)',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 800
              }}
            >
              <span>Total Paid</span>
              <span style={{ color: 'var(--li-primary)' }}>₹{Number(selectedRental.totalAmount || 0).toLocaleString('en-IN')}.00</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button
                onClick={() => window.print()}
                className="li-btn li-btn-primary li-btn-sm"
              >
                <Printer size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRentalsPage;
