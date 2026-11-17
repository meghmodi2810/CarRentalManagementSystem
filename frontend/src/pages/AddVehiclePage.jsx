import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { CATEGORY_PLACEHOLDERS, getPlaceholderForCategory } from '../utils/carPlaceholders';

const AVAILABLE_FEATURES = [
  'Air Conditioning',
  'Bluetooth Connectivity',
  'GPS Navigation',
  'Reverse Camera',
  'Apple CarPlay / Android Auto',
  'Dual Front Airbags',
  'ABS with EBD',
  'Sunroof',
  'Leatherette Seats',
  'Keyless Push Start'
];

const AddVehiclePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    category: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seatingCapacity: 5,
    dailyRate: '2500',
    location: 'Central Branch',
    imageUrl: CATEGORY_PLACEHOLDERS.Sedan.svg,
    features: ['Air Conditioning', 'Bluetooth Connectivity', 'Reverse Camera', 'Apple CarPlay / Android Auto']
  });

  const [selectedPlaceholderCategory, setSelectedPlaceholderCategory] = useState('Sedan');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [createdCar, setCreatedCar] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // When category changes, update default placeholder if user hasn't uploaded custom photo
      if (name === 'category' && (!prev.imageUrl || prev.imageUrl.startsWith('data:image/svg+xml'))) {
        updated.imageUrl = getPlaceholderForCategory(value);
        setSelectedPlaceholderCategory(value);
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    setServerError(null);
  };

  const handleCategoryPlaceholderSelect = (catKey) => {
    setSelectedPlaceholderCategory(catKey);
    setFormData((prev) => ({
      ...prev,
      category: catKey,
      imageUrl: CATEGORY_PLACEHOLDERS[catKey].svg
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setServerError('Image file size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: reader.result
      }));
      setSelectedPlaceholderCategory(null);
    };
    reader.readAsDataURL(file);
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
    if (!formData.model.trim()) errs.model = 'Model name is required';
    if (!formData.licensePlate.trim()) errs.licensePlate = 'License plate is required';
    if (!formData.location.trim()) errs.location = 'Pick-up location / city is required';
    if (!formData.dailyRate || Number(formData.dailyRate) <= 0) {
      errs.dailyRate = 'Enter a valid daily rental rate in Rs. (greater than 0)';
    }
    if (!formData.year || Number(formData.year) < 1990 || Number(formData.year) > new Date().getFullYear() + 1) {
      errs.year = 'Enter a valid year (1990 - present)';
    }
    if (!formData.seatingCapacity || Number(formData.seatingCapacity) < 1 || Number(formData.seatingCapacity) > 15) {
      errs.seatingCapacity = 'Seats must be between 1 and 15';
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
        imageUrl: formData.imageUrl || getPlaceholderForCategory(formData.category),
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
    <div className="linkedin-container" style={{ maxWidth: '820px' }}>
      <Link to="/fleet" className="li-back-btn">
        <ArrowLeft size={16} /> Back to fleet
      </Link>

      {createdCar ? (
        <div className="li-card li-state-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <CheckCircle2 size={52} color="var(--li-success)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--li-text-primary)' }}>
            Vehicle Successfully Listed!
          </h2>
          <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
            Your <strong>{createdCar.make} {createdCar.model}</strong> ({createdCar.licensePlate}) is now registered under your account. When customers submit booking requests at <strong>₹{Number(createdCar.dailyRate).toLocaleString('en-IN')}/day</strong>, you will receive a request to accept or decline.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/cars/${createdCar._id}`} className="li-btn li-btn-primary">
              View Vehicle Listing
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
                  dailyRate: '2500',
                  location: 'Central Branch',
                  imageUrl: CATEGORY_PLACEHOLDERS.Sedan.svg,
                  features: ['Air Conditioning', 'Bluetooth Connectivity', 'Reverse Camera', 'Apple CarPlay / Android Auto']
                });
                setSelectedPlaceholderCategory('Sedan');
              }}
              className="li-btn li-btn-subtle"
            >
              List Another Vehicle
            </button>
          </div>
        </div>
      ) : (
        <div className="li-card" style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ borderBottom: '1px solid var(--li-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={22} color="var(--li-primary)" />
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--li-text-primary)' }}>
                List a Vehicle for Rent
              </h1>
            </div>
            <p style={{ color: 'var(--li-text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Register your car on DriveFlow to receive booking requests from verified drivers. You retain full control to accept or reject any rental request.
            </p>
          </div>

          {serverError && (
            <div className="li-alert li-alert-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section 1: Basic Identity */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--li-text-primary)', marginBottom: '0.85rem' }}>
                1. Vehicle Identity
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="li-form-group">
                  <label className="li-label">Make / Brand *</label>
                  <input
                    type="text"
                    name="make"
                    placeholder="e.g. Hyundai, Tata, Maruti Suzuki, Toyota"
                    value={formData.make}
                    onChange={handleInputChange}
                    className={`li-input ${errors.make ? 'li-input-error' : ''}`}
                  />
                  {errors.make && <span className="li-error-msg">{errors.make}</span>}
                </div>

                <div className="li-form-group">
                  <label className="li-label">Model Name *</label>
                  <input
                    type="text"
                    name="model"
                    placeholder="e.g. Creta, Safari, Swift, Fortuner, City"
                    value={formData.model}
                    onChange={handleInputChange}
                    className={`li-input ${errors.model ? 'li-input-error' : ''}`}
                  />
                  {errors.model && <span className="li-error-msg">{errors.model}</span>}
                </div>

                <div className="li-form-group">
                  <label className="li-label">Registration / License Plate *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    placeholder="e.g. MH-02-CB-1234"
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
            </div>

            {/* Section 2: Specifications */}
            <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--li-border)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--li-text-primary)', marginBottom: '0.85rem' }}>
                2. Specifications & Performance
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="li-form-group">
                  <label className="li-label">Vehicle Category</label>
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

                <div className="li-form-group">
                  <label className="li-label">Seating Capacity *</label>
                  <input
                    type="number"
                    name="seatingCapacity"
                    min="1"
                    max="15"
                    value={formData.seatingCapacity}
                    onChange={handleInputChange}
                    className={`li-input ${errors.seatingCapacity ? 'li-input-error' : ''}`}
                  />
                  {errors.seatingCapacity && <span className="li-error-msg">{errors.seatingCapacity}</span>}
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Pickup Location */}
            <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--li-border)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--li-text-primary)', marginBottom: '0.85rem' }}>
                3. Pricing & Rental Location
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="li-form-group">
                  <label className="li-label">Daily Rental Rate (₹ / day) *</label>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--li-text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.95rem'
                      }}
                    >
                      ₹
                    </span>
                    <input
                      type="number"
                      name="dailyRate"
                      min="100"
                      step="50"
                      placeholder="e.g. 2500"
                      value={formData.dailyRate}
                      onChange={handleInputChange}
                      className={`li-input ${errors.dailyRate ? 'li-input-error' : ''}`}
                      style={{ paddingLeft: '28px' }}
                    />
                  </div>
                  {errors.dailyRate && <span className="li-error-msg">{errors.dailyRate}</span>}
                </div>

                <div className="li-form-group">
                  <label className="li-label">Pick-up Location / Branch *</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Airport T2 Hub, Downtown Central, SG Highway"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`li-input ${errors.location ? 'li-input-error' : ''}`}
                  />
                  {errors.location && <span className="li-error-msg">{errors.location}</span>}
                </div>
              </div>
            </div>

            {/* Section 4: Vehicle Image Placeholder Selector & Local Upload */}
            <div style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--li-border)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.65rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--li-text-primary)' }}>
                  4. Vehicle Image Placeholder & Photo
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                  Select an image placeholder or upload a real photo
                </span>
              </div>

              {/* Category Placeholders Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {Object.keys(CATEGORY_PLACEHOLDERS).map((catKey) => {
                  const isSelected = selectedPlaceholderCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => handleCategoryPlaceholderSelect(catKey)}
                      style={{
                        padding: '0.5rem 0.25rem',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? 'var(--li-primary)' : 'var(--li-border)'}`,
                        backgroundColor: isSelected ? 'var(--li-primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Car size={18} color={isSelected ? 'var(--li-primary)' : 'var(--li-text-secondary)'} style={{ margin: '0 auto 4px' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--li-primary)' : 'var(--li-text-primary)', display: 'block' }}>
                        {catKey}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Local File Upload Row */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--li-border)' }}>
                <label
                  className="li-btn li-btn-outline li-btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', margin: 0 }}
                >
                  <Upload size={14} /> Upload Custom Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--li-text-secondary)' }}>
                  {selectedPlaceholderCategory
                    ? `Currently using clean ${selectedPlaceholderCategory} vector placeholder.`
                    : 'Custom photo uploaded successfully.'}
                </span>
              </div>

              {/* Live Preview Container */}
              <div style={{ marginTop: '0.85rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--li-border)', height: '180px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                <img
                  src={formData.imageUrl}
                  alt="Vehicle Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(15,23,42,0.75)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                >
                  Live Listing Preview
                </span>
              </div>
            </div>

            {/* Section 5: Included Amenities */}
            <div style={{ marginBottom: '1.75rem', borderTop: '1px solid var(--li-border)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--li-text-primary)', marginBottom: '0.75rem' }}>
                5. Included Amenities & Safety
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {AVAILABLE_FEATURES.map((feature) => {
                  const checked = formData.features.includes(feature);
                  return (
                    <label
                      key={feature}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.825rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '6px',
                        border: `1px solid ${checked ? 'var(--li-primary)' : 'var(--li-border)'}`,
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

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--li-border)', paddingTop: '1.25rem' }}>
              <Link to="/fleet" className="li-btn li-btn-subtle">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="li-btn li-btn-primary"
                style={{ minWidth: '180px' }}
              >
                {submitting ? 'Listing Vehicle...' : 'Publish Vehicle to Fleet'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddVehiclePage;
