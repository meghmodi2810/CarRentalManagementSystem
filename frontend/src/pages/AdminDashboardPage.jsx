import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import {
  Car,
  CalendarCheck,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  X
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('fleet');

  // Fleet state
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [carsError, setCarsError] = useState(null);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Add Car Modal state
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [carFormData, setCarFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    category: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seatingCapacity: 5,
    dailyRate: '',
    location: '',
    imageUrl: '',
    features: 'Bluetooth, Backup Camera, Cruise Control'
  });
  const [carFormErrors, setCarFormErrors] = useState({});
  const [submittingCar, setSubmittingCar] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchCars = async () => {
    setCarsLoading(true);
    setCarsError(null);
    try {
      const res = await api.get('/cars');
      setCars(res.data.data || []);
    } catch (err) {
      setCarsError(err.response?.data?.message || 'Failed to load fleet');
    } finally {
      setCarsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const res = await api.get('/rentals');
      setBookings(res.data.data || []);
    } catch (err) {
      setBookingsError(err.response?.data?.message || 'Failed to load reservations');
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setUsersError(err.response?.data?.message || 'Failed to load user directory');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'fleet') fetchCars();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const handleCarInputChange = (e) => {
    const { name, value } = e.target;
    setCarFormData((prev) => ({ ...prev, [name]: value }));
    if (carFormErrors[name]) {
      setCarFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateCarForm = () => {
    const errors = {};
    if (!carFormData.make.trim()) errors.make = 'Make is required';
    if (!carFormData.model.trim()) errors.model = 'Model is required';
    if (!carFormData.licensePlate.trim()) errors.licensePlate = 'License plate is required';
    if (!carFormData.dailyRate || Number(carFormData.dailyRate) <= 0) {
      errors.dailyRate = 'Valid daily rate is required';
    }
    if (!carFormData.location.trim()) errors.location = 'Location is required';
    return errors;
  };

  const handleAddCarSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCarForm();
    if (Object.keys(errors).length > 0) {
      setCarFormErrors(errors);
      return;
    }

    setSubmittingCar(true);
    try {
      const payload = {
        ...carFormData,
        year: Number(carFormData.year),
        seatingCapacity: Number(carFormData.seatingCapacity),
        dailyRate: Number(carFormData.dailyRate),
        features: carFormData.features.split(',').map((f) => f.trim()).filter(Boolean)
      };

      await api.post('/cars', payload);
      setActionNotice({ type: 'success', text: 'New vehicle successfully added to fleet!' });
      setShowAddCarModal(false);
      setCarFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        category: 'Sedan',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seatingCapacity: 5,
        dailyRate: '',
        location: '',
        imageUrl: '',
        features: 'Bluetooth, Backup Camera, Cruise Control'
      });
      fetchCars();
    } catch (err) {
      setActionNotice({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to add vehicle'
      });
    } finally {
      setSubmittingCar(false);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from the fleet?')) return;
    try {
      await api.delete(`/cars/${carId}`);
      setActionNotice({ type: 'success', text: 'Vehicle removed from fleet.' });
      fetchCars();
    } catch (err) {
      setActionNotice({ type: 'danger', text: err.response?.data?.message || 'Delete failed.' });
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/rentals/${bookingId}/status`, { status: newStatus });
      setActionNotice({ type: 'success', text: `Reservation updated to ${newStatus}.` });
      fetchBookings();
    } catch (err) {
      setActionNotice({ type: 'danger', text: err.response?.data?.message || 'Update failed.' });
    }
  };

  return (
    <div className="linkedin-container">
      <div className="li-admin-header">
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--li-primary)', textTransform: 'uppercase' }}>
            Administrative Operations
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--li-text-primary)' }}>
            DriveFlow Admin Control Center
          </h1>
        </div>
        {activeTab === 'fleet' && (
          <button onClick={() => setShowAddCarModal(true)} className="li-btn li-btn-primary li-btn-sm">
            <Plus size={16} /> Add Vehicle
          </button>
        )}
      </div>

      {actionNotice && (
        <div className={`li-alert li-alert-${actionNotice.type}`}>
          <AlertCircle size={16} />
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="li-admin-tabs">
        <button
          onClick={() => setActiveTab('fleet')}
          className={`li-admin-tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
        >
          <Car size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Fleet Inventory
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`li-admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          <CalendarCheck size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Reservations ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`li-admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Registered Users ({users.length})
        </button>
      </div>

      {/* Fleet Tab */}
      {activeTab === 'fleet' && (
        <div className="li-card">
          {carsLoading && <LoadingSpinner message="Loading fleet inventory..." />}
          {!carsLoading && carsError && <ErrorMessage message={carsError} onRetry={fetchCars} />}
          {!carsLoading && !carsError && cars.length === 0 && (
            <EmptyState
              icon={Car}
              title="Fleet is empty"
              message="No vehicles are in the database yet."
              actionText="Add Vehicle"
              onAction={() => setShowAddCarModal(true)}
            />
          )}
          {!carsLoading && !carsError && cars.length > 0 && (
            <div className="li-table-wrap">
              <table className="li-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Plate</th>
                    <th>Category</th>
                    <th>Rate / Day</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={car.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=100&q=80'}
                            alt={car.model}
                            style={{ width: '44px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div>
                            <strong>{car.make} {car.model}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                              {car.year} • {car.fuelType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><code>{car.licensePlate}</code></td>
                      <td><span className="li-badge li-badge-category">{car.category}</span></td>
                      <td><strong>${car.dailyRate}</strong></td>
                      <td>{car.location}</td>
                      <td><span className={`li-badge li-badge-${car.status}`}>{car.status}</span></td>
                      <td>
                        <button
                          onClick={() => handleDeleteCar(car._id)}
                          className="li-btn li-btn-danger-outline li-btn-sm"
                          title="Delete vehicle"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="li-card">
          {bookingsLoading && <LoadingSpinner message="Loading reservations..." />}
          {!bookingsLoading && bookingsError && <ErrorMessage message={bookingsError} onRetry={fetchBookings} />}
          {!bookingsLoading && !bookingsError && bookings.length === 0 && (
            <EmptyState icon={CalendarCheck} title="No bookings found" />
          )}
          {!bookingsLoading && !bookingsError && bookings.length > 0 && (
            <div className="li-table-wrap">
              <table className="li-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Change Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td><code>#{b._id.slice(-6).toUpperCase()}</code></td>
                      <td>
                        <strong>{b.customer?.name || 'Customer'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>{b.customer?.email}</div>
                      </td>
                      <td>
                        {b.car ? `${b.car.make} ${b.car.model}` : 'Deleted Car'}
                      </td>
                      <td>
                        <div style={{ fontSize: '0.785rem' }}>
                          {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td><strong>${b.totalAmount}</strong></td>
                      <td><span className={`li-badge li-badge-${b.status}`}>{b.status}</span></td>
                      <td>
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className="li-select"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.785rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="li-card">
          {usersLoading && <LoadingSpinner message="Loading user directory..." />}
          {!usersLoading && usersError && <ErrorMessage message={usersError} onRetry={fetchUsers} />}
          {!usersLoading && !usersError && users.length === 0 && (
            <EmptyState icon={Users} title="No users registered yet" />
          )}
          {!usersLoading && !usersError && users.length > 0 && (
            <div className="li-table-wrap">
              <table className="li-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Driving License</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`li-badge li-badge-${u.role === 'admin' ? 'rented' : 'available'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.phone || '—'}</td>
                      <td><code>{u.drivingLicenseNumber || '—'}</code></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add New Car Modal */}
      {showAddCarModal && (
        <div className="li-modal-overlay" onClick={() => setShowAddCarModal(false)}>
          <div className="li-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="li-modal-head">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add New Vehicle to Fleet</h2>
              <button
                onClick={() => setShowAddCarModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCarSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="li-form-group">
                  <label className="li-label">Make / Brand *</label>
                  <input
                    type="text"
                    name="make"
                    value={carFormData.make}
                    onChange={handleCarInputChange}
                    className={`li-input ${carFormErrors.make ? 'li-input-error' : ''}`}
                    placeholder="e.g. Audi"
                  />
                  {carFormErrors.make && <span className="li-error-msg">{carFormErrors.make}</span>}
                </div>
                <div className="li-form-group">
                  <label className="li-label">Model *</label>
                  <input
                    type="text"
                    name="model"
                    value={carFormData.model}
                    onChange={handleCarInputChange}
                    className={`li-input ${carFormErrors.model ? 'li-input-error' : ''}`}
                    placeholder="e.g. Q5 S-Line"
                  />
                  {carFormErrors.model && <span className="li-error-msg">{carFormErrors.model}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="li-form-group">
                  <label className="li-label">License Plate *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={carFormData.licensePlate}
                    onChange={handleCarInputChange}
                    className={`li-input ${carFormErrors.licensePlate ? 'li-input-error' : ''}`}
                    placeholder="e.g. AU-901-QS"
                  />
                  {carFormErrors.licensePlate && (
                    <span className="li-error-msg">{carFormErrors.licensePlate}</span>
                  )}
                </div>
                <div className="li-form-group">
                  <label className="li-label">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={carFormData.year}
                    onChange={handleCarInputChange}
                    className="li-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="li-form-group">
                  <label className="li-label">Category</label>
                  <select
                    name="category"
                    value={carFormData.category}
                    onChange={handleCarInputChange}
                    className="li-select"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Electric">Electric</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div className="li-form-group">
                  <label className="li-label">Daily Rate ($) *</label>
                  <input
                    type="number"
                    name="dailyRate"
                    value={carFormData.dailyRate}
                    onChange={handleCarInputChange}
                    className={`li-input ${carFormErrors.dailyRate ? 'li-input-error' : ''}`}
                    placeholder="e.g. 95"
                  />
                  {carFormErrors.dailyRate && (
                    <span className="li-error-msg">{carFormErrors.dailyRate}</span>
                  )}
                </div>
              </div>

              <div className="li-form-group">
                <label className="li-label">Branch / Location *</label>
                <input
                  type="text"
                  name="location"
                  value={carFormData.location}
                  onChange={handleCarInputChange}
                  className={`li-input ${carFormErrors.location ? 'li-input-error' : ''}`}
                  placeholder="e.g. Airport Terminal 1"
                />
                {carFormErrors.location && (
                  <span className="li-error-msg">{carFormErrors.location}</span>
                )}
              </div>

              <div className="li-form-group">
                <label className="li-label">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={carFormData.imageUrl}
                  onChange={handleCarInputChange}
                  className="li-input"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCarModal(false)}
                  className="li-btn li-btn-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCar}
                  className="li-btn li-btn-primary"
                >
                  {submittingCar ? 'Saving...' : 'Add to Fleet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
