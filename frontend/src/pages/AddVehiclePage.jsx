import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Car, CheckCircle2, AlertCircle, Plus, Image as ImageIcon } from 'lucide-react';

const POPULAR_CAR_IMAGES = [
  { label: 'Luxury Sedan (Black)', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Electric Sedan (White)', url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Premium SUV (Blue)', url: 'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Executive Sedan (Silver)', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Compact Hatchback (Red)', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Passenger Van (Dark)', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80' }
];

const AVAILABLE_FEATURES = [
  'Bluetooth',
  'GPS Navigation',
  'Backup Camera',
  'Leather Seats',
  'Sunroof',
  'Heated Seats',
  'Cruise Control',
  'Apple CarPlay',
  'All-Wheel Drive',
  'Child Safety Seat'
];

const AddVehiclePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
    features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay']
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [createdCar, setCreatedCar] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError(null);
  };

  const toggleFeature = (feature) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature);
      const updated = exists
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: updated };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.make.trim()) errs.make = 'Make / Brand is required';
    if (!formData.model.trim()) errs.model = 'Model is required';
    if (!formData.licensePlate.trim()) errs.licensePlate = 'License plate is required';
    if (!formData.location.trim()) errs.location = 'Pick-up location / branch is required';
    if (!formData.dailyRate || Number(formData.dailyRate) <= 0) {
      errs.dailyRate = 'Please enter a valid daily rental rate greater than 0';
    }
    if (!formData.year || Number(formData.year) < 1990 || Number(formData.year) > new Date().getFullYear() + 1) {
      errs.year = 'Enter a valid model year (1990 - present)';
    }
    if (!formData.seatingCapacity || Number(formData.seatingCapacity) < 1 || Number(formData.seatingCapacity) > 15) {
      errs.seatingCapacity = 'Seating capacity must be between 1 and 15';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        category: formData.category,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seatingCapacity: Number(formData.seatingCapacity),
        dailyRate: Number(formData.dailyRate),
        location: formData.location.trim(),
        imageUrl:
          formData.imageUrl.trim() ||
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        features: formData.features,
        status: 'available'
      };

      const res = await api.post('/cars', payload);
      setCreatedCar(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to list vehicle. Please check the details and try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="linkedin-container" style={{ maxWidth: '780px' }}>
      <Link to="/fleet" className="li-back-btn">
        <ArrowLeft size={16} /> Back to fleet
      </Link>

      {createdCar ? (
        <div className="li-card li-state-card" style={{ padding: '2.5rem 1.5rem' }}>
          <CheckCircle2 size={52} color="var(--li-success)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Vehicle Successfully Listed
          </h2>
          <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.9rem', maxWidth: '480px', marginBottom: '1.5rem' }}>
            <strong>{createdCar.make} {createdCar.model}</strong> ({createdCar.licensePlate}) is now active in the fleet and available for reservations at <strong>${createdCar.dailyRate}/day</strong>.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to={`/cars/${createdCar._id}`} className="li-btn li-btn-primary">
              View Vehicle Page
            </Link>
            <Link to="/fleet" className="li-btn li-btn-subtle">
              Return to Fleet Feed
            </Link>
            <button
              onClick={() => {
                setCreatedCar(null);
                setFormData({
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
                  features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay']
                });
              }}
              className="li-btn li-btn-subtle"
            >
              List Another Car
            </button>
          </div>
        </div>
      ) : (
        <div className="li-card" style={{ padding: '1.75rem' }}>
          <div style={{ borderBottom: '1px solid var(--li-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--li-text-primary)' }}>
              List a Vehicle for Rent
            </h1>
            <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Add a new vehicle to the fleet database to offer it for customer reservations.
            </p>
          </div>

          {serverError && (
            <div className="li-alert li-alert-danger">
              <AlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1: Make and Model */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="li-form-group">
                <label className="li-label">Make / Brand *</label>
                <input
                  type="text"
                  name="make"
                  placeholder="e.g. Audi, BMW, Toyota, Honda"
                  value={formData.make}
                  onChange={handleInputChange}
                  className={`li-input ${errors.make ? 'li-input-error' : ''}`}
                />
                {errors.make && <span className="li-error-msg">{errors.make}</span>}
              </div>

              <div className="li-form-group">
                <label className="li-label">Model *</label>
                <input
                  type="text"
                  name="model"
                  placeholder="e.g. A4, 3 Series, Camry, Civic"
                  value={formData.model}
                  onChange={handleInputChange}
                  className={`li-input ${errors.model ? 'li-input-error' : ''}`}
                />
                {errors.model && <span className="li-error-msg">{errors.model}</span>}
              </div>
            </div>

            {/* Row 2: License Plate and Year */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="li-form-group">
                <label className="li-label">License Plate *</label>
                <input
                  type="text"
                  name="licensePlate"
                  placeholder="e.g. DL-01-AX-1234"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  className={`li-input ${errors.licensePlate ? 'li-input-error' : ''}`}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.licensePlate && <span className="li-error-msg">{errors.licensePlate}</span>}
              </div>

              <div className="li-form-group">
                <label className="li-label">Model Year *</label>
                <input
                  type="number"
                  name="year"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={handleInputChange}
                  className={`li-input ${errors.year ? 'li-input-error' : ''}`}
                />
                {errors.year && <span className="li-error-msg">{errors.year}</span>}
              </div>
            </div>

            {/* Row 3: Category, Transmission, Fuel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
              <div className="li-form-group">
                <label className="li-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
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
                <label className="li-label">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="li-select"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="li-form-group">
                <label className="li-label">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="li-select"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Row 4: Seating, Daily Rate, Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 150px 1fr', gap: '1rem' }}>
              <div className="li-form-group">
                <label className="li-label">Seats *</label>
                <input
                  type="number"
                  name="seatingCapacity"
                  min="1"
                  max="15"
                  value={formData.seatingCapacity}
                  onChange={handleInputChange}
                  className={`li-input ${errors.seatingCapacity ? 'li-input-error' : ''}`}
                />
                {errors.seatingCapacity && (
                  <span className="li-error-msg">{errors.seatingCapacity}</span>
                )}
              </div>

              <div className="li-form-group">
                <label className="li-label">Daily Rate ($) *</label>
                <input
                  type="number"
                  name="dailyRate"
                  min="1"
                  step="1"
                  placeholder="e.g. 95"
                  value={formData.dailyRate}
                  onChange={handleInputChange}
                  className={`li-input ${errors.dailyRate ? 'li-input-error' : ''}`}
                />
                {errors.dailyRate && <span className="li-error-msg">{errors.dailyRate}</span>}
              </div>

              <div className="li-form-group">
                <label className="li-label">Pick-up Location / Branch *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Downtown Central Hub, Airport T1"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`li-input ${errors.location ? 'li-input-error' : ''}`}
                />
                {errors.location && <span className="li-error-msg">{errors.location}</span>}
              </div>
            </div>

            {/* Row 5: Image URL & Quick Sample Presets */}
            <div className="li-form-group" style={{ marginTop: '0.5rem' }}>
              <label className="li-label">Vehicle Image URL</label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="li-input"
              />
              <span style={{ fontSize: '0.725rem', color: 'var(--li-text-secondary)', marginTop: '4px' }}>
                Paste a public image link, or select a preset photo below:
              </span>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {POPULAR_CAR_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: preset.url }))}
                    className="li-btn li-btn-subtle li-btn-sm"
                    style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                  >
                    <ImageIcon size={12} /> {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 6: Features Checklist */}
            <div className="li-form-group" style={{ marginTop: '1rem' }}>
              <label className="li-label">Included Features</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem', marginTop: '0.35rem' }}>
                {AVAILABLE_FEATURES.map((feature) => {
                  const checked = formData.features.includes(feature);
                  return (
                    <label
                      key={feature}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.825rem',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid var(--li-border)',
                        backgroundColor: checked ? 'var(--li-primary-light)' : '#ffffff',
                        color: checked ? 'var(--li-primary)' : 'var(--li-text-primary)',
                        cursor: 'pointer',
                        fontWeight: checked ? 600 : 400
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFeature(feature)}
                        style={{ accentColor: 'var(--li-primary)' }}
                      />
                      <span>{feature}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--li-border)' }}>
              <Link to="/fleet" className="li-btn li-btn-subtle">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="li-btn li-btn-primary"
              >
                {submitting ? 'Adding Vehicle...' : 'Publish Vehicle to Fleet'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddVehiclePage;
