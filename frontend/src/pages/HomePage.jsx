import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CarCard from '../components/CarCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Car,
  Filter,
  SlidersHorizontal,
  ShieldCheck,
  Info,
  CalendarCheck,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Hatchback', 'Luxury', 'Electric', 'Van'];

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Controlled search and filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  // Async states
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchNotice, setFetchNotice] = useState(null);

  const fetchCars = async () => {
    setLoading(true);
    setFetchNotice(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (sort) params.sort = sort;

      const res = await api.get('/cars', { params });
      setCars(res.data.data || []);
    } catch (err) {
      setFetchNotice('Unable to refresh latest vehicle data. Displaying available fleet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [category, sort]);

  // Sync search param from navbar
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
          {/* User Profile Mini-Card */}
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
                {isAuthenticated ? user?.name : 'DriveFlow Member'}
              </h3>
              <p className="li-profile-headline">
                {isAuthenticated
                  ? `${user?.role === 'admin' ? 'Fleet Administrator' : 'Verified Renter'} • ${user?.email}`
                  : 'Rent premium vehicles with transparent pricing & instant confirmation'}
              </p>

              {isAuthenticated ? (
                <div className="li-profile-stats">
                  <Link to="/my-rentals" className="li-profile-stat-row">
                    <span>My Bookings</span>
                    <span className="li-profile-stat-val">View</span>
                  </Link>
                  <Link to="/add-car" className="li-profile-stat-row">
                    <span>List a Vehicle</span>
                    <span className="li-profile-stat-val">+ Add</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="li-profile-stat-row">
                      <span>Admin Hub</span>
                      <span className="li-profile-stat-val">Manage</span>
                    </Link>
                  )}
                  <Link to="/profile" className="li-profile-stat-row">
                    <span>Account Settings</span>
                    <span className="li-profile-stat-val">Edit</span>
                  </Link>
                </div>
              ) : (
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to="/" className="li-btn li-btn-primary li-btn-block li-btn-sm">
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
          {/* Search Bar Widget */}
          <div className="li-card li-search-widget">
            <form onSubmit={handleSearchSubmit} className="li-search-widget-row">
              <input
                type="text"
                placeholder="Search by make, model, or city (e.g. Audi, Tesla, BMW, Downtown)..."
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

          {fetchNotice && (
            <div className="li-alert li-alert-danger" style={{ marginBottom: '1rem' }}>
              <span>{fetchNotice}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && <LoadingSpinner message="Loading available fleet..." />}

          {/* Clean Empty State: shown when no cars match search/filter */}
          {!loading && cars.length === 0 && (
            <EmptyState
              icon={Car}
              title="No vehicles found"
              message="No vehicles are currently available matching your selected criteria. Try selecting another category, adjusting your search term, or listing a new vehicle."
              actionText="Reset Filters"
              onAction={handleResetFilters}
            />
          )}

          {/* Dynamic Cars Feed */}
          {!loading && cars.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0 0.25rem' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--li-text-secondary)', fontWeight: 600 }}>
                  Showing {cars.length} available {cars.length === 1 ? 'vehicle' : 'vehicles'}
                </span>
                <Link to="/add-car" className="li-btn li-btn-outline li-btn-sm">
                  <Plus size={14} /> List a Vehicle
                </Link>
              </div>

              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}
        </main>

        {/* ========================================================
            RIGHT RAIL: Clean Commercial Information & Host CTA
            ======================================================== */}
        <aside className="li-right-rail">
          {/* List Your Car Promotion Widget */}
          <div className="li-card li-widget-card" style={{ borderLeft: '3px solid var(--li-primary)' }}>
            <div className="li-widget-header">
              <span>List Your Car for Rent</span>
              <Car size={16} color="var(--li-primary)" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--li-text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
              Turn your idle vehicle into passive income. List your car on DriveFlow in less than 2 minutes and rent it to verified drivers.
            </p>
            <Link to="/add-car" className="li-btn li-btn-primary li-btn-block li-btn-sm">
              <Plus size={14} /> Add Vehicle Now
            </Link>
          </div>

          {/* DriveFlow Policies Widget */}
          <div className="li-card li-widget-card">
            <div className="li-widget-header">
              <span>DriveFlow Rental Guidelines</span>
              <Info size={16} color="var(--li-text-secondary)" />
            </div>

            <ul className="li-news-list">
              <li className="li-news-item">
                <h4>Flexible Cancellation</h4>
                <p>Free cancellation up to 24h before scheduled pickup.</p>
              </li>
              <li className="li-news-item">
                <h4>Insurance Included</h4>
                <p>Every booking includes basic collision and theft protection.</p>
              </li>
              <li className="li-news-item">
                <h4>24/7 Roadside Assistance</h4>
                <p>Dedicated customer support team available around the clock.</p>
              </li>
              <li className="li-news-item">
                <h4>Verified Drivers Only</h4>
                <p>Drivers must provide a valid driving license number upon booking.</p>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
