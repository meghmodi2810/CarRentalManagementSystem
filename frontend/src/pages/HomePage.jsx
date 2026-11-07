import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CarCard from '../components/CarCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import {
  Car,
  Filter,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Info,
  CalendarCheck,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Hatchback', 'Luxury', 'Electric', 'Van'];

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Controlled states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  // Async states: Loading, Error, Empty
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (sort) params.sort = sort;

      const res = await api.get('/cars', { params });
      setCars(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to the fleet API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [category, sort]);

  // Sync search param from navbar if present
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== search) {
      setSearch(q);
      fetchCars();
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('newest');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="linkedin-container">
      <div className="li-grid-layout">
        {/* ========================================================
            LEFT RAIL: User Identity & Category Filters
            ======================================================== */}
        <aside className="li-left-rail">
          {/* User Profile Mini-Card (LinkedIn Identity Card) */}
          <div className="li-card">
            <div className="li-profile-card-header">
              <div className="li-profile-avatar-wrap">
                <div className="li-avatar-lg">
                  {isAuthenticated ? getInitials(user?.name) : <Car size={32} />}
                </div>
              </div>
            </div>

            <div className="li-profile-card-body">
              <h3 className="li-profile-name">
                {isAuthenticated ? user?.name : 'Welcome to DriveFlow'}
              </h3>
              <p className="li-profile-headline">
                {isAuthenticated
                  ? `${user?.role === 'admin' ? 'Fleet Administrator' : 'Verified Renter'} • ${user?.email}`
                  : 'Rent premium vehicles with transparent pricing & instant confirmation'}
              </p>

              {isAuthenticated ? (
                <div className="li-profile-stats">
                  <Link to="/my-rentals" className="li-profile-stat-row">
                    <span>Manage My Bookings</span>
                    <span className="li-profile-stat-val">→</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="li-profile-stat-row">
                      <span>Admin Operations</span>
                      <span className="li-profile-stat-val">Dashboard</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to="/login" className="li-btn li-btn-primary li-btn-block li-btn-sm">
                    Sign in to book
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Categories Filter Card */}
          <div className="li-card li-filter-card">
            <h4 className="li-filter-title">
              <Filter size={16} /> Filter by Category
            </h4>
            <div className="li-category-list">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`li-category-btn ${category === cat ? 'active' : ''}`}
                >
                  <span>{cat}</span>
                  {category === cat && <CheckCircle size={14} />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ========================================================
            CENTER FEED: Search Widget & Vehicle Listings
            ======================================================== */}
        <main className="li-center-feed">
          {/* Search Bar Widget (like LinkedIn "Start a post") */}
          <div className="li-card li-search-widget">
            <form onSubmit={handleSearchSubmit} className="li-search-widget-row">
              <input
                type="text"
                placeholder="Search by make, model, or branch (e.g. Tesla, BMW, Downtown)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="li-feed-search-input"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="li-sort-select"
                title="Sort Fleet"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="year_desc">Year: Newest First</option>
              </select>

              <button type="submit" className="li-btn li-btn-primary li-btn-sm">
                Search
              </button>
            </form>
          </div>

          {/* Feed States: Loading, Error, Empty, and Feed Cards */}
          {loading && <LoadingSpinner message="Loading vehicle fleet..." />}

          {!loading && error && (
            <ErrorMessage message={error} onRetry={fetchCars} />
          )}

          {!loading && !error && cars.length === 0 && (
            <EmptyState
              icon={Car}
              title="No vehicles found in fleet"
              message="No vehicles match your search or filter criteria. Try resetting filters."
              actionText="Clear Filters"
              onAction={handleResetFilters}
            />
          )}

          {!loading && !error && cars.length > 0 && (
            <div>
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}
        </main>

        {/* ========================================================
            RIGHT RAIL: DriveFlow Guidelines & Academic Info
            ======================================================== */}
        <aside className="li-right-rail">
          {/* DriveFlow Highlights Widget */}
          <div className="li-card li-widget-card">
            <div className="li-widget-header">
              <span>DriveFlow News & Policies</span>
              <Info size={16} color="var(--li-text-secondary)" />
            </div>

            <ul className="li-news-list">
              <li className="li-news-item">
                <h4>Flexible Cancellation</h4>
                <p>Free cancellation up to 24h before scheduled pickup.</p>
              </li>
              <li className="li-news-item">
                <h4>Full Insurance Coverage</h4>
                <p>Every booking includes collision & theft protection.</p>
              </li>
              <li className="li-news-item">
                <h4>24/7 Roadside Assistance</h4>
                <p>Complimentary roadside support across all branches.</p>
              </li>
              <li className="li-news-item">
                <h4>Digital License Verification</h4>
                <p>Upload DL details once for instant rental approvals.</p>
              </li>
            </ul>
          </div>

          {/* Academic Practical Definition Card */}
          <div className="li-card li-widget-card">
            <div className="li-widget-header">
              <span>Practical Definition</span>
              <Sparkles size={16} color="var(--li-primary)" />
            </div>

            <div className="li-course-badge-box">
              <span className="li-course-code">IT7050 - Full Stack Web Dev</span>
              <span>M.Sc.(IT) Semester 1 Practical</span>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span>• React.js (Vite) + Node/Express</span>
                <span>• MongoDB + Mongoose Schemas</span>
                <span>• JWT Access + Refresh Rotation</span>
                <span>• Helmet, CORS & Rate Limiting</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
