import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Settings2, MapPin, CheckCircle2, Car } from 'lucide-react';

const CarCard = ({ car }) => {
  return (
    <article className="li-card li-vehicle-card">
      {/* Header: Company / Vehicle Identity */}
      <div className="li-vehicle-header">
        <div className="li-vehicle-author-wrap">
          <div className="li-vehicle-avatar">
            <Car size={22} />
          </div>
          <div className="li-vehicle-title-wrap">
            <Link to={`/cars/${car._id}`} className="li-vehicle-title">
              {car.make} {car.model}
            </Link>
            <div className="li-vehicle-meta">
              <span>{car.year}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <MapPin size={12} /> {car.location}
              </span>
              <span>•</span>
              <span className="li-badge li-badge-category">{car.category}</span>
            </div>
          </div>
        </div>

        <span className={`li-badge li-badge-${car.status}`}>
          {car.status}
        </span>
      </div>

      {/* Vehicle Media Image */}
      <Link to={`/cars/${car._id}`} className="li-vehicle-img-wrap" style={{ display: 'block' }}>
        <img
          src={car.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
          alt={`${car.make} ${car.model}`}
          className="li-vehicle-img"
          loading="lazy"
        />
      </Link>

      {/* Specs Chips */}
      <div className="li-specs-row">
        <span className="li-spec-chip" title="Capacity">
          <Users size={14} /> {car.seatingCapacity} Seats
        </span>
        <span className="li-spec-chip" title="Transmission">
          <Settings2 size={14} /> {car.transmission}
        </span>
        <span className="li-spec-chip" title="Fuel Type">
          <Fuel size={14} /> {car.fuelType}
        </span>
        {car.licensePlate && (
          <span className="li-spec-chip" style={{ fontFamily: 'monospace' }}>
            {car.licensePlate}
          </span>
        )}
      </div>

      {/* Equipped Highlights */}
      {car.features && car.features.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
          {car.features.slice(0, 3).map((feat, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.725rem',
                color: 'var(--li-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <CheckCircle2 size={12} color="var(--li-success)" /> {feat}
            </span>
          ))}
        </div>
      )}

      {/* Card Action Footer */}
      <div className="li-vehicle-footer">
        <div className="li-rate-wrap">
          <span className="li-rate-curr">$</span>
          <span className="li-rate-number">{car.dailyRate}</span>
          <span className="li-rate-period">/ day</span>
        </div>

        <div className="li-card-actions">
          <Link to={`/cars/${car._id}`} className="li-btn li-btn-subtle li-btn-sm">
            View details
          </Link>
          <Link
            to={`/cars/${car._id}`}
            className={`li-btn ${car.status === 'available' ? 'li-btn-primary' : 'li-btn-subtle'} li-btn-sm`}
          >
            {car.status === 'available' ? 'Reserve vehicle' : 'Unavailable'}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CarCard;
