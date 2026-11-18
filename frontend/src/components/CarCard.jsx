import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Settings2, MapPin, CheckCircle2, Car, Heart } from 'lucide-react';
import { getPlaceholderForCategory } from '../utils/carPlaceholders';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CarCard = ({ car }) => {
  const { user, isAuthenticated } = useAuth();
  const fallbackImg = getPlaceholderForCategory(car.category);

  const userId = (user?.id || user?._id)?.toString();
  const initialLiked = Boolean(
    userId && car.likes && car.likes.map((id) => (id._id || id).toString()).includes(userId)
  );

  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(car.likesCount || car.likes?.length || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please sign in to save vehicles to your favorites.');
      return;
    }

    // Optimistic update
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    setLikeLoading(true);
    try {
      const res = await api.post(`/cars/${car._id}/like`);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      // Revert on error
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setLikeLoading(false);
    }
  };

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Like / Save Button */}
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={likeLoading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '4px',
              color: isLiked ? '#ef4444' : 'var(--li-text-secondary)',
              transition: 'transform 0.15s ease'
            }}
            title={isLiked ? 'Saved to Favorites' : 'Save for later'}
          >
            <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} />
            {likesCount > 0 && (
              <span style={{ fontSize: '0.725rem', fontWeight: 600 }}>{likesCount}</span>
            )}
          </button>

          <span className={`li-badge li-badge-${car.status}`}>
            {car.status}
          </span>
        </div>
      </div>

      {/* Vehicle Media Image */}
      <Link to={`/cars/${car._id}`} className="li-vehicle-img-wrap" style={{ display: 'block' }}>
        <img
          src={car.imageUrl || fallbackImg}
          alt={`${car.make} ${car.model}`}
          className="li-vehicle-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImg;
          }}
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
          <span className="li-rate-curr">₹</span>
          <span className="li-rate-number">{(car.dailyRate || 0).toLocaleString('en-IN')}</span>
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
            {car.status === 'available' ? 'Request to Book' : 'Unavailable'}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CarCard;
