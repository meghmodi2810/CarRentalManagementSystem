import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  AlertCircle,
  Ban,
  Car,
  FileText,
  Printer,
  X,
  CheckCircle2
} from 'lucide-react';

const MyRentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Selected rental for Receipt / Invoice Modal
  const [selectedRental, setSelectedRental] = useState(null);

  const fetchMyRentals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/rentals/my-rentals');
      setRentals(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve your rental bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRentals();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await api.patch(`/rentals/${id}/status`, { status: 'cancelled' });
      setActionNotice({ type: 'success', text: 'Reservation cancelled successfully.' });
      fetchMyRentals();
    } catch (err) {
      setActionNotice({
        type: 'danger',
        text: err.response?.data?.message || 'Could not cancel reservation.'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="linkedin-container" style={{ maxWidth: '840px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--li-text-primary)' }}>
            My Rental Reservations
          </h1>
          <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.85rem' }}>
            View your active bookings, past trips, and reservation details
          </p>
        </div>
        <Link to="/fleet" className="li-btn li-btn-outline li-btn-sm">
          Browse Fleet
        </Link>
      </div>

      {actionNotice && (
        <div className={`li-alert li-alert-${actionNotice.type}`}>
          <AlertCircle size={16} />
          <span>{actionNotice.text}</span>
        </div>
      )}

      {loading && <LoadingSpinner message="Retrieving your bookings from database..." />}

      {!loading && error && <ErrorMessage message={error} onRetry={fetchMyRentals} />}

      {!loading && !error && rentals.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          message="You haven't made any vehicle reservations. Explore our fleet and reserve your next trip!"
          actionText="Explore Fleet"
          actionLink="/fleet"
        />
      )}

      {!loading && !error && rentals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rentals.map((rental) => {
            const car = rental.car;
            return (
              <div key={rental._id} className="li-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '60px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid var(--li-border)'
                      }}
                    >
                      {car?.imageUrl ? (
                        <img src={car.imageUrl} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Car size={24} style={{ margin: '18px auto', display: 'block', color: 'var(--li-text-secondary)' }} />
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--li-text-primary)' }}>
                        {car ? `${car.make} ${car.model}` : 'Vehicle Reserved'}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                        Booking Ref: <code>#{rental._id.slice(-6).toUpperCase()}</code> • {rental.totalDays} {rental.totalDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>

                  <span className={`li-badge li-badge-${rental.status}`}>
                    {rental.status}
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
                    <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>Dates</span>
                    <strong>{formatDate(rental.startDate)} → {formatDate(rental.endDate)}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>Pickup / Return</span>
                    <span>{rental.pickupLocation}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--li-text-secondary)' }}>Total Billed</span>
                    <strong style={{ color: 'var(--li-primary)', fontSize: '0.95rem' }}>${rental.totalAmount}.00</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => setSelectedRental(rental)}
                    className="li-btn li-btn-subtle li-btn-sm"
                  >
                    <FileText size={14} /> View Invoice
                  </button>

                  {['pending', 'confirmed'].includes(rental.status) && (
                    <button
                      onClick={() => handleCancel(rental._id)}
                      className="li-btn li-btn-danger-outline li-btn-sm"
                    >
                      <Ban size={14} /> Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
                <span>{new Date(selectedRental.createdAt).toLocaleDateString()}</span>
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
                <span style={{ color: 'var(--li-text-secondary)' }}>Duration</span>
                <span>{selectedRental.totalDays} {selectedRental.totalDays === 1 ? 'Day' : 'Days'} @ ${selectedRental.dailyRate}/day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--li-text-secondary)' }}>Pickup / Return Location</span>
                <span>{selectedRental.pickupLocation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--li-text-secondary)' }}>Payment Status</span>
                <span className="li-badge li-badge-available">PAID</span>
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
              <span>Total Amount</span>
              <span style={{ color: 'var(--li-primary)' }}>${selectedRental.totalAmount}.00</span>
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
